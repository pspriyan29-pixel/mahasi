# PANDUAN LENGKAP DASHBOARD - AI Insight Engine

## 📊 Daftar Fitur Dashboard

Dashboard AI Insight Engine memiliki fitur-fitur lengkap untuk monitoring dan analytics real-time:

### 1. **Dashboard Utama** (`/dashboard`)
### 2. **API Keys Management** (`/dashboard/api-keys`)
### 3. **Webhooks** (`/dashboard/webhooks`)
### 4. **Team Management** (`/dashboard/team`)
### 5. **Events** (`/dashboard/events`)
### 6. **Alerts** (`/dashboard/alerts`)
### 7. **AI Insights** (`/dashboard/insights`)
### 8. **Predictive Analytics** (`/dashboard/predictive-analytics`)
### 9. **Settings** (`/dashboard/settings`)

---

## 🎯 1. Dashboard Utama

### Fitur:
- ✅ **Real-time Metrics**
  - Total Events (jumlah event yang diproses)
  - Events/Second (kecepatan processing)
  - Active Alerts (alert yang aktif)
  - Kafka Lag (delay processing)

- ✅ **AI Insights Panel**
  - Deteksi anomali otomatis
  - Severity levels (LOW, MEDIUM, HIGH)
  - Possible causes
  - Recommended actions

- ✅ **Charts & Visualizations**
  - Event Volume Chart (30 menit terakhir)
  - Regional Distribution (Pie Chart)
  - Anomaly Detection Timeline

- ✅ **System Health Monitoring**
  - Kafka Consumer status
  - Database status
  - AI Service status
  - API Gateway status

- ✅ **Real-time Event Stream**
  - Live feed dari Kafka
  - Event details (type, region, amount)
  - Timestamp tracking

### Cara Menggunakan:
1. Buka `/dashboard`
2. Monitor metrics real-time di bagian atas
3. Check AI Insights untuk anomali
4. Lihat charts untuk trend analysis
5. Monitor system health di panel kanan bawah

---

## 🔑 2. API Keys Management

### Fitur:
- ✅ **Generate API Keys**
  - Format: `sk_live_[32 karakter random]`
  - Auto-generate dengan satu klik
  - Custom naming untuk setiap key

- ✅ **Key Management**
  - View/Hide key (toggle visibility)
  - Copy to clipboard
  - Regenerate key
  - Delete key

- ✅ **Permissions**
  - `read:events` - Baca data events
  - `write:events` - Tulis data events
  - Custom permissions per key

- ✅ **Statistics**
  - Total Keys
  - Active Keys
  - Revoked Keys

- ✅ **Security Features**
  - Key masking (hanya tampilkan 8 karakter pertama)
  - Last used tracking
  - Status monitoring (active/revoked)

### Cara Menggunakan:

#### Generate New Key:
1. Klik button **"Generate New Key"**
2. Masukkan nama key (contoh: "Production API Key")
3. Klik **"Generate Key"**
4. Key akan otomatis muncul dan visible
5. **PENTING**: Copy key segera (hanya ditampilkan sekali!)

#### Regenerate Key:
1. Klik button **"Regenerate"** pada key yang ingin di-regenerate
2. Confirm action
3. Key baru akan di-generate
4. Key lama otomatis invalid

#### Delete Key:
1. Klik button **"Delete"** pada key yang ingin dihapus
2. Confirm action
3. Key akan dihapus permanent

#### Copy Key:
1. Klik icon **"Eye"** untuk show key
2. Klik icon **"Copy"** untuk copy ke clipboard
3. Toast notification akan muncul

---

## 🔗 3. Webhooks

### Fitur:
- ✅ **Webhook Configuration**
  - URL endpoint configuration
  - Event type selection
  - Secret key untuk security
  - Active/Inactive toggle

- ✅ **Event Filtering**
  - Subscribe ke specific events
  - Multiple event types per webhook
  - Custom event filters

- ✅ **Webhook Testing**
  - Send test event
  - View response
  - Debug logs

- ✅ **Retry Logic**
  - Automatic retry dengan exponential backoff
  - Max retry configuration
  - Failure notifications

- ✅ **Webhook Logs**
  - Request/Response history
  - Status codes
  - Timestamps
  - Error messages

### Cara Menggunakan:

#### Create Webhook:
1. Klik **"Add Webhook"**
2. Masukkan URL endpoint (contoh: `https://api.example.com/webhook`)
3. Pilih events yang ingin di-subscribe
4. Generate secret key (optional)
5. Klik **"Create Webhook"**

#### Test Webhook:
1. Pilih webhook yang ingin di-test
2. Klik **"Send Test Event"**
3. Check response di logs
4. Verify endpoint menerima data

#### Monitor Webhook:
1. View logs untuk setiap webhook
2. Check success/failure rate
3. Debug errors jika ada
4. Monitor latency

---

## 👥 4. Team Management

### Fitur:
- ✅ **Team Members**
  - View all team members
  - Member details (name, email, role)
  - Last active tracking

- ✅ **Role Management**
  - **Admin**: Full access
  - **User**: Read/Write access
  - **Viewer**: Read-only access

- ✅ **Invite Members**
  - Email invitation
  - Role assignment
  - Custom permissions

- ✅ **Member Actions**
  - Update role
  - Remove member
  - Resend invitation

### Cara Menggunakan:

#### Invite Member:
1. Klik **"Invite Member"**
2. Masukkan email address
3. Pilih role (Admin/User/Viewer)
4. Klik **"Send Invitation"**
5. Member akan menerima email invitation

#### Change Role:
1. Pilih member yang ingin diubah rolenya
2. Klik dropdown role
3. Pilih role baru
4. Confirm changes

#### Remove Member:
1. Klik **"Remove"** pada member
2. Confirm action
3. Member akan dihapus dari team

---

## 📊 5. Events

### Fitur:
- ✅ **Event List**
  - Real-time event stream
  - Pagination
  - Search & filter

- ✅ **Event Details**
  - Event type
  - Timestamp
  - Region
  - Amount/Value
  - Metadata

- ✅ **Filtering**
  - By event type
  - By region
  - By date range
  - By status

- ✅ **Export**
  - Export to CSV
  - Export to JSON
  - Custom date range

### Cara Menggunakan:

#### View Events:
1. Buka `/dashboard/events`
2. Scroll untuk melihat event list
3. Click event untuk details

#### Filter Events:
1. Gunakan filter di bagian atas
2. Pilih event type
3. Pilih date range
4. Apply filter

#### Export Events:
1. Pilih date range
2. Klik **"Export"**
3. Pilih format (CSV/JSON)
4. Download file

---

## 🚨 6. Alerts

### Fitur:
- ✅ **Alert Management**
  - View active alerts
  - Alert history
  - Alert details

- ✅ **Alert Configuration**
  - Threshold settings
  - Alert conditions
  - Notification channels

- ✅ **Alert Actions**
  - Acknowledge alert
  - Resolve alert
  - Snooze alert

- ✅ **Notification Channels**
  - Email notifications
  - Slack integration
  - Webhook notifications

### Cara Menggunakan:

#### View Alerts:
1. Buka `/dashboard/alerts`
2. Lihat active alerts
3. Click untuk details

#### Configure Alert:
1. Klik **"New Alert"**
2. Set threshold (contoh: Events/sec > 1000)
3. Pilih notification channel
4. Save configuration

#### Resolve Alert:
1. Click alert yang ingin di-resolve
2. Add resolution notes
3. Click **"Resolve"**

---

## 🧠 7. AI Insights

### Fitur:
- ✅ **Anomaly Detection**
  - Automatic anomaly detection
  - Severity classification
  - Root cause analysis

- ✅ **AI Analysis**
  - Pattern recognition
  - Trend analysis
  - Predictive insights

- ✅ **Recommendations**
  - Actionable recommendations
  - Best practices
  - Optimization suggestions

- ✅ **Insight History**
  - Historical insights
  - Trend over time
  - Accuracy metrics

### Cara Menggunakan:

#### View Insights:
1. Buka `/dashboard/insights`
2. Lihat latest AI insights
3. Check severity levels

#### Analyze Anomaly:
1. Click pada anomaly insight
2. View possible causes
3. Check recommended actions
4. Take action

---

## 📈 8. Predictive Analytics

### Fitur:
- ✅ **Forecasting**
  - Event volume prediction
  - Trend forecasting
  - Capacity planning

- ✅ **Pattern Analysis**
  - Seasonal patterns
  - Anomaly patterns
  - User behavior patterns

- ✅ **Recommendations**
  - Scaling recommendations
  - Optimization suggestions
  - Cost predictions

### Cara Menggunakan:

#### View Predictions:
1. Buka `/dashboard/predictive-analytics`
2. Select time range
3. View predictions

#### Analyze Trends:
1. Check trend charts
2. Identify patterns
3. Plan capacity

---

## ⚙️ 9. Settings

### Fitur:
- ✅ **Profile Settings**
  - Update profile information
  - Change avatar
  - Update email

- ✅ **Security Settings**
  - Change password
  - Two-factor authentication
  - Session management

- ✅ **Notification Settings**
  - Email preferences
  - Slack integration
  - Alert preferences

- ✅ **API Configuration**
  - API endpoints
  - Rate limits
  - Timeout settings

### Cara Menggunakan:

#### Update Profile:
1. Buka `/dashboard/settings`
2. Click **"Profile"** tab
3. Update information
4. Save changes

#### Configure Notifications:
1. Click **"Notifications"** tab
2. Toggle notification types
3. Set preferences
4. Save settings

---

## 🔧 Troubleshooting

### Dashboard tidak load:
1. Check internet connection
2. Refresh browser (Ctrl+F5)
3. Clear browser cache
4. Check console untuk errors

### API Keys tidak berfungsi:
1. Verify key masih active
2. Check permissions
3. Regenerate key jika perlu
4. Contact support

### Webhooks gagal:
1. Check endpoint URL
2. Verify secret key
3. Check webhook logs
4. Test dengan test event

### Real-time updates tidak jalan:
1. Check WebSocket connection
2. Verify Supabase connection
3. Refresh page
4. Check network tab

---

## 📱 Responsive Design

Semua fitur dashboard sudah fully responsive:

### Mobile (320px - 768px):
- ✅ Single column layout
- ✅ Touch-optimized buttons (min 44px)
- ✅ Collapsible sidebar
- ✅ Swipe gestures
- ✅ Mobile-optimized charts

### Tablet (768px - 1024px):
- ✅ 2-column layout
- ✅ Optimized spacing
- ✅ Responsive charts
- ✅ Touch-friendly controls

### Desktop (1024px+):
- ✅ Full layout
- ✅ Multi-column grids
- ✅ Advanced charts
- ✅ Keyboard shortcuts

---

## ⌨️ Keyboard Shortcuts

- `Ctrl + K` - Quick search
- `Ctrl + /` - Show shortcuts
- `Esc` - Close dialogs
- `Enter` - Submit forms
- `Tab` - Navigate fields

---

## 🎯 Best Practices

### API Keys:
1. Gunakan key berbeda untuk setiap environment
2. Rotate keys secara berkala
3. Jangan commit keys ke Git
4. Gunakan environment variables

### Webhooks:
1. Gunakan HTTPS endpoints
2. Validate webhook signatures
3. Implement retry logic
4. Monitor webhook health

### Team Management:
1. Assign minimal permissions
2. Review team access regularly
3. Remove inactive members
4. Use role-based access control

### Monitoring:
1. Set up alerts untuk metrics penting
2. Monitor system health regularly
3. Review AI insights daily
4. Export data untuk backup

---

## 📞 Support

Jika ada pertanyaan atau masalah:

- 📧 Email: infomahasi@gmail.com
- 📱 Phone: +62 853-7896-3269
- 📚 Documentation: README.md
- 🐛 Bug Reports: GitHub Issues

