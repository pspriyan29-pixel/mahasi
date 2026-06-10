// Helper logika perhitungan harga otomatis FlashWork

export interface PricingInput {
  serviceSlug: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'complex';
  priority: 'normal' | 'cepat' | 'express' | 'super_urgent';
  quantity: number; // Jumlah halaman untuk laporan, jumlah slide untuk PPT, jumlah fitur/halaman untuk coding
  isPremiumDesign: boolean;
  needsReferences: boolean;
}

export interface PricingResult {
  basePrice: number;
  difficultyFee: number;
  quantityFee: number;
  priorityFee: number;
  designFee: number;
  referenceFee: number;
  totalPrice: number;
}

export function calculatePrice(input: PricingInput): PricingResult {
  const { serviceSlug, difficulty, priority, quantity, isPremiumDesign, needsReferences } = input;

  let basePrice = 20000;
  let quantityPricePerUnit = 0; // Halaman/slide tambahan setelah halaman/slide pertama

  // Tentukan harga dasar berdasarkan jenis layanan
  if (serviceSlug === 'laporan-makalah') {
    basePrice = 1000;
    quantityPricePerUnit = 1000; // 1rb (1k) per halaman
  } else if (serviceSlug === 'ppt-presentasi') {
    basePrice = 20000;
    quantityPricePerUnit = 7000; // 7rb per slide tambahan
  } else if (serviceSlug === 'coding-website') {
    basePrice = 100000;
    quantityPricePerUnit = 50000; // 50rb per fitur tambahan
  } else if (serviceSlug === 'custom-request') {
    basePrice = 30000;
    quantityPricePerUnit = 10000;
  }

  // 1. Difficulty Fee
  let difficultyFee = 0;
  if (difficulty === 'easy') {
    difficultyFee = 0;
  } else if (difficulty === 'normal') {
    difficultyFee = basePrice * 0.25; // +25%
  } else if (difficulty === 'hard') {
    difficultyFee = basePrice * 0.75; // +75%
  } else if (difficulty === 'complex') {
    difficultyFee = basePrice * 1.5; // +150%
  }

  // 2. Quantity Fee
  const quantityFee = Math.max(0, quantity - 1) * quantityPricePerUnit;

  // 3. Design Fee (PPT & Coding)
  let designFee = 0;
  if (isPremiumDesign) {
    if (serviceSlug === 'ppt-presentasi') {
      designFee = 15000;
    } else if (serviceSlug === 'coding-website') {
      designFee = 50000;
    } else {
      designFee = 5000;
    }
  }

  // 4. Reference Fee (Makalah / Dokumen)
  let referenceFee = 0;
  if (needsReferences && (serviceSlug === 'laporan-makalah' || serviceSlug === 'custom-request')) {
    referenceFee = 15000;
  }

  // Subtotal sebelum prioritas
  const subtotal = basePrice + difficultyFee + quantityFee + designFee + referenceFee;

  // 5. Priority Fee (Urgent Fee)
  let priorityMultiplier = 0;
  if (priority === 'normal') {
    priorityMultiplier = 0;
  } else if (priority === 'cepat') {
    priorityMultiplier = 0.25; // +25%
  } else if (priority === 'express') {
    priorityMultiplier = 0.50; // +50%
  } else if (priority === 'super_urgent') {
    priorityMultiplier = 0.75; // +75%
  }

  const priorityFee = Math.round(subtotal * priorityMultiplier);

  // Total
  const totalPrice = subtotal + priorityFee;

  return {
    basePrice,
    difficultyFee: Math.round(difficultyFee),
    quantityFee,
    priorityFee,
    designFee,
    referenceFee,
    totalPrice
  };
}
