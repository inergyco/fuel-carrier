export type SeedCompanyUser = {
  username: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  level: 'admin' | 'viewer';
};

export type SeedDriver = {
  firstName: string;
  lastName: string;
  nationalId: string;
};

export type SeedCar = {
  name: string;
  licensePlate: string;
  note?: string;
  /** Index into the company's drivers array; omit for unassigned cars. */
  driverIndex?: number;
  /** Demo GPS position around the company's operating region. */
  latitude?: number;
  longitude?: number;
};

export type SeedCompany = {
  name: string;
  nationalId: string;
  phoneNumber: string;
  address: string;
  note: string;
  logoUrl?: string;
  users: SeedCompanyUser[];
  drivers: SeedDriver[];
  cars: SeedCar[];
};

/** Marker national ID — if this company exists, the seed has already run. */
export const SEED_MARKER_NATIONAL_ID = '14005678901';

export const SEED_COMPANIES: SeedCompany[] = [
  {
    name: 'شرکت حمل و نقل سوخت پارس انرژی',
    nationalId: SEED_MARKER_NATIONAL_ID,
    phoneNumber: '02188765432',
    address: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۱۲۳۴',
    note: 'حمل سوخت بین‌شهری و توزیع در استان تهران',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e8/Shell_logo.svg',
    users: [
      {
        username: 'pars_admin',
        firstName: 'علی',
        lastName: 'رضایی',
        nationalId: '0012345678',
        email: 'ali.rezaei@pars-energy.ir',
        level: 'admin',
      },
      {
        username: 'pars_ops',
        firstName: 'سارا',
        lastName: 'محمدی',
        nationalId: '0023456789',
        email: 'sara.mohammadi@pars-energy.ir',
        level: 'viewer',
      },
      {
        username: 'pars_dispatch',
        firstName: 'حسن',
        lastName: 'کریمی',
        nationalId: '0034567890',
        email: 'hassan.karimi@pars-energy.ir',
        level: 'viewer',
      },
    ],
    drivers: [
      { firstName: 'محمد', lastName: 'حسینی', nationalId: '1234567890' },
      { firstName: 'رضا', lastName: 'احمدی', nationalId: '2345678901' },
      { firstName: 'امیر', lastName: 'قاسمی', nationalId: '3456789012' },
      { firstName: 'علی', lastName: 'موسوی', nationalId: '4567890123' },
    ],
    cars: [
      {
        name: 'تریلی ۳۶۰۰۰ لیتر',
        licensePlate: '۱۲ب۳۴۵-۶۷',
        note: 'حمل بنزین سوپر',
        driverIndex: 0,
        latitude: 35.7575,
        longitude: 51.4097,
      },
      {
        name: 'تانکر ۲۴۰۰۰ لیتر',
        licensePlate: '۴۵ج۷۸۹-۲۱',
        note: 'حمل گازوئیل',
        driverIndex: 1,
        latitude: 35.7219,
        longitude: 51.3347,
      },
      {
        name: 'تریلی ۳۲۰۰۰ لیتر',
        licensePlate: '۷۸د۱۲۳-۴۵',
        driverIndex: 2,
        latitude: 35.6892,
        longitude: 51.389,
      },
      {
        name: 'تانکر ۱۸۰۰۰ لیتر',
        licensePlate: '۳۴س۵۶۷-۸۹',
        note: 'توزیع شهری',
        latitude: 35.7448,
        longitude: 51.3755,
      },
    ],
  },
  {
    name: 'شرکت پخش فرآورده‌های نفتی کیمیا',
    nationalId: '14007891234',
    phoneNumber: '03136547890',
    address: 'اصفهان، شهرک صنعتی مورچه‌خورت، بلوار نفت، پلاک ۵۶',
    note: 'پخش سوخت در استان اصفهان و چهارمحال و بختیاری',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8e/Bp-logo.svg',
    users: [
      {
        username: 'kimia_admin',
        firstName: 'مهدی',
        lastName: 'نوری',
        nationalId: '1122334455',
        email: 'mehdi.nouri@kimia-oil.ir',
        level: 'admin',
      },
      {
        username: 'kimia_logistics',
        firstName: 'فاطمه',
        lastName: 'صادقی',
        nationalId: '2233445566',
        email: 'fateme.sadeghi@kimia-oil.ir',
        level: 'viewer',
      },
      {
        username: 'kimia_fleet',
        firstName: 'جواد',
        lastName: 'اکبری',
        nationalId: '3344556677',
        email: 'javad.akbari@kimia-oil.ir',
        level: 'viewer',
      },
    ],
    drivers: [
      { firstName: 'حسین', lastName: 'جعفری', nationalId: '5678901234' },
      { firstName: 'مجید', lastName: 'رحیمی', nationalId: '6789012345' },
      { firstName: 'سعید', lastName: 'زارعی', nationalId: '7890123456' },
      { firstName: 'کامران', lastName: 'شریفی', nationalId: '8901234567' },
    ],
    cars: [
      {
        name: 'تریلی ۴۰۰۰۰ لیتر',
        licensePlate: '۲۳ب۴۵۶-۷۸',
        note: 'حمل نفت کوره',
        driverIndex: 0,
        latitude: 32.6546,
        longitude: 51.668,
      },
      {
        name: 'تانکر ۲۸۰۰۰ لیتر',
        licensePlate: '۵۶ج۷۸۹-۱۲',
        driverIndex: 1,
        latitude: 32.6714,
        longitude: 51.6852,
      },
      {
        name: 'تریلی ۳۶۰۰۰ لیتر',
        licensePlate: '۸۹د۰۱۲-۳۴',
        note: 'حمل بنزین معمولی',
        driverIndex: 2,
        latitude: 32.6405,
        longitude: 51.6552,
      },
      {
        name: 'تانکر ۲۰۰۰۰ لیتر',
        licensePlate: '۱۱س۲۳۴-۵۶',
        latitude: 32.6619,
        longitude: 51.7011,
      },
    ],
  },
  {
    name: 'مجتمع حمل سوخت زاگرس جنوب',
    nationalId: '14009123456',
    phoneNumber: '07132345678',
    address: 'شیراز، بلوار امام خمینی، کوچه ۱۵، ساختمان زاگرس، طبقه ۳',
    note: 'حمل سوخت در استان‌های فارس، بوشهر و هرمزگان',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/en/3/3b/TotalEnergies_logo.svg',
    users: [
      {
        username: 'zagros_admin',
        firstName: 'رضوان',
        lastName: 'ملکی',
        nationalId: '4455667788',
        email: 'rezvan.maleki@zagros-fuel.ir',
        level: 'admin',
      },
      {
        username: 'zagros_ops',
        firstName: 'پرویز',
        lastName: 'بهرامی',
        nationalId: '5566778899',
        email: 'parviz.bahrami@zagros-fuel.ir',
        level: 'viewer',
      },
      {
        username: 'zagros_hr',
        firstName: 'نرگس',
        lastName: 'حیدری',
        nationalId: '6677889900',
        email: 'narges.heidari@zagros-fuel.ir',
        level: 'viewer',
      },
    ],
    drivers: [
      { firstName: 'داود', lastName: 'مرادی', nationalId: '9012345678' },
      { firstName: 'فرهاد', lastName: 'یزدانی', nationalId: '0123456789' },
      { firstName: 'بهمن', lastName: 'کاظمی', nationalId: '1098765432' },
      { firstName: 'ایمان', lastName: 'فلاح', nationalId: '2109876543' },
    ],
    cars: [
      {
        name: 'تریلی ۴۵۰۰۰ لیتر',
        licensePlate: '۶۷ب۸۹۰-۱۲',
        note: 'حمل گازوئیل صنعتی',
        driverIndex: 0,
        latitude: 29.5918,
        longitude: 52.5837,
      },
      {
        name: 'تانکر ۳۰۰۰۰ لیتر',
        licensePlate: '۹۰ج۱۲۳-۴۵',
        driverIndex: 1,
        latitude: 29.6103,
        longitude: 52.5311,
      },
      {
        name: 'تریلی ۳۶۰۰۰ لیتر',
        licensePlate: '۱۳د۴۵۶-۷۸',
        note: 'حمل بنزین سوپر',
        driverIndex: 2,
        latitude: 29.6335,
        longitude: 52.5211,
      },
      {
        name: 'تانکر ۲۲۰۰۰ لیتر',
        licensePlate: '۴۶س۷۸۹-۰۱',
        driverIndex: 3,
        latitude: 29.5742,
        longitude: 52.5989,
      },
    ],
  },
];
