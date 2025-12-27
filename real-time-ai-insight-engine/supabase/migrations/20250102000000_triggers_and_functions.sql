-- Database Triggers for Automation

-- Trigger: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.organizations;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.data_sources;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.data_sources
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.alerts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.alert_rules;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.alert_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.dashboards;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.dashboards
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.webhooks;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Send webhook on alert creation
CREATE OR REPLACE FUNCTION public.handle_new_alert()
RETURNS TRIGGER AS $$
DECLARE
  webhook_record RECORD;
BEGIN
  -- Find active webhooks for this organization
  FOR webhook_record IN
    SELECT * FROM public.webhooks
    WHERE organization_id = NEW.organization_id
      AND enabled = TRUE
      AND 'alert.created' = ANY(events)
  LOOP
    -- Insert webhook delivery job
    INSERT INTO public.webhook_deliveries (
      webhook_id,
      event_type,
      payload
    ) VALUES (
      webhook_record.id,
      'alert.created',
      jsonb_build_object(
        'alert_id', NEW.id,
        'title', NEW.title,
        'severity', NEW.severity,
        'status', NEW.status,
        'created_at', NEW.created_at
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_alert_created ON public.alerts;
CREATE TRIGGER on_alert_created
  AFTER INSERT ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_alert();

-- Trigger: Send webhook on insight generation
CREATE OR REPLACE FUNCTION public.handle_new_insight()
RETURNS TRIGGER AS $$
DECLARE
  webhook_record RECORD;
BEGIN
  -- Only send webhook for anomalies
  IF NEW.status = 'ANOMALY' THEN
    FOR webhook_record IN
      SELECT * FROM public.webhooks
      WHERE organization_id = NEW.organization_id
        AND enabled = TRUE
        AND 'insight.generated' = ANY(events)
    LOOP
      INSERT INTO public.webhook_deliveries (
        webhook_id,
        event_type,
        payload
      ) VALUES (
        webhook_record.id,
        'insight.generated',
        jsonb_build_object(
          'insight_id', NEW.id,
          'status', NEW.status,
          'severity', NEW.severity,
          'summary', NEW.summary,
          'created_at', NEW.created_at
        )
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_insight_created ON public.ai_insights;
CREATE TRIGGER on_insight_created
  AFTER INSERT ON public.ai_insights
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_insight();

-- Function: Get organization statistics
CREATE OR REPLACE FUNCTION public.get_organization_stats(org_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_events', (
      SELECT COUNT(*) FROM public.events WHERE organization_id = org_id
    ),
    'active_alerts', (
      SELECT COUNT(*) FROM public.alerts 
      WHERE organization_id = org_id AND status = 'open'
    ),
    'total_insights', (
      SELECT COUNT(*) FROM public.ai_insights WHERE organization_id = org_id
    ),
    'anomaly_count', (
      SELECT COUNT(*) FROM public.ai_insights 
      WHERE organization_id = org_id AND status = 'ANOMALY'
    ),
    'data_sources', (
      SELECT COUNT(*) FROM public.data_sources 
      WHERE organization_id = org_id AND status = 'active'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get recent activity
CREATE OR REPLACE FUNCTION public.get_recent_activity(
  org_id UUID,
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  activity_type TEXT,
  activity_data JSON,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'event'::TEXT as activity_type,
    json_build_object(
      'event_id', e.event_id,
      'event_type', e.event_type,
      'amount', e.amount
    ) as activity_data,
    e.created_at
  FROM public.events e
  WHERE e.organization_id = org_id
  UNION ALL
  SELECT 
    'insight'::TEXT,
    json_build_object(
      'insight_id', i.id,
      'status', i.status,
      'severity', i.severity,
      'summary', i.summary
    ),
    i.created_at
  FROM public.ai_insights i
  WHERE i.organization_id = org_id
  UNION ALL
  SELECT 
    'alert'::TEXT,
    json_build_object(
      'alert_id', a.id,
      'title', a.title,
      'status', a.status,
      'severity', a.severity
    ),
    a.created_at
  FROM public.alerts a
  WHERE a.organization_id = org_id
  ORDER BY created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
