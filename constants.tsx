import React from 'react';
import {
  ClipboardList,
  Users,
  Scale,
  Gavel,
  FileText,
  PenTool,
  Briefcase,
  ShieldCheck,
  FileCheck,
  Building2,
  Trophy,
  Star,
  Clock,
  Zap,
  Lock
} from 'lucide-react';
import { Service, Founder, Stat, Testimonial, Feature } from './types';

export const COLORS = {
  primary: '#0B3D2E', // Dark Emerald Green
  accent: '#C8A762',  // Gold
  white: '#FFFFFF',
  bgLight: '#F8F9FA',
};

// Helper to get Icon Component
export const getIcon = (name: string, className?: string) => {
  const props = { className: className || "w-6 h-6" };
  switch (name) {
    case 'ClipboardList': return <ClipboardList {...props} />;
    case 'Users': return <Users {...props} />;
    case 'Scale': return <Scale {...props} />;
    case 'Gavel': return <Gavel {...props} />;
    case 'FileText': return <FileText {...props} />;
    case 'PenTool': return <PenTool {...props} />;
    case 'Briefcase': return <Briefcase {...props} />;
    case 'ShieldCheck': return <ShieldCheck {...props} />;
    case 'FileCheck': return <FileCheck {...props} />;
    case 'Building2': return <Building2 {...props} />;
    case 'Trophy': return <Trophy {...props} />;
    case 'Star': return <Star {...props} />;
    case 'Clock': return <Clock {...props} />;
    case 'Zap': return <Zap {...props} />;
    case 'Lock': return <Lock {...props} />;
    default: return <Scale {...props} />;
  }
};

const AR_CONTENT = {
  nav: [
    { name: 'الرئيسية', href: '#hero' },
    { name: 'خدماتنا', href: '#services' },
    { name: 'المؤسسون', href: '#founders' },
    { name: 'عملاؤنا', href: '#clients' },
    { name: 'تواصل معنا', href: '#footer' },
  ],
  hero: {
    title: "شركة نظامي.. شريكك القانوني الرقمي الموثوق",
    subtitle: "أكثر من 15 عاماً من الخبرة نضعها بين يديك. نجمع بين النخبة القانونية والحلول الرقمية لضمان دقة الامتثال وسرعة الإنجاز، بما يتماشى مع رؤية المملكة 2030.",
    cta1: "اطلب خدمة فورية",
    cta2: "تصفح خدماتنا",
    cta3: "شاهد فيديو تعريفي",
  },
  featuresTitle: "لماذا نحن خيارك الأول؟",
  features: [
    {
      icon: 'ShieldCheck',
      title: 'خبرة وتوافق',
      desc: 'فريق يضم نخبة المستشارين، وحلولنا متوافقة تماماً مع رؤية 2030.'
    },
    {
      icon: 'Zap',
      title: 'حلول ذكية',
      desc: 'نقدم خدمات سريعة ودقيقة تساعدك على اتخاذ القرارات في وقت أقل.'
    },
    {
      icon: 'Lock',
      title: 'خصوصية تامة',
      desc: 'نلتزم بأعلى معايير الأمان وحماية البيانات لضمان سرية أعمالك.'
    }
  ] as Feature[],
  servicesTitle: "خدماتنا",
  servicesSubtitle: "مجموعة متكاملة من الخدمات القانونية المصممة لتلبية احتياجاتك بدقة واحترافية",
  services: [
    {
      id: 1,
      title: 'دراسة قضية',
      description: 'إذا كان موضوعك يحتوي الكثير من التفاصيل والعقود والإثباتات وتصكوك الأحكام المطلوب دراستها للوصول للإجابات التي تحتاجها.',
      icon: 'ClipboardList',
      buttonText: 'اطلب دراسة قضية',
      isPrimary: true,
      whatsappMessage: 'مرحباً، أرغب في طلب خدمة دراسة قضية.'
    },
    {
      id: 2,
      title: 'حضور جلسات',
      description: 'إذا كنت مشغول، حصل لك ظرف أو ما عندك رغبة لتحضر الجلسة لأي سبب كان.. وكل محامي يحضر الجلسة ويرافع عنك فيها.',
      icon: 'Users',
      buttonText: 'احجز محامي للجلسة',
      isPrimary: true,
      whatsappMessage: 'مرحباً، أرغب في حجز محامي لحضور جلسة.'
    },
    {
      id: 3,
      title: 'الترافع والتوكيل',
      description: 'توكيل محامي للترافع عنك في القضية بشكل كامل حتى صدور الحكم الابتدائي أو القطعي وتقديم طلب التنفيذ عند الحاجة.',
      icon: 'Scale',
      buttonText: 'وكّل محامي',
      isPrimary: true,
      whatsappMessage: 'مرحباً، أرغب في توكيل محامي للترافع.'
    },
    {
      id: 4,
      title: 'طلبات تنفيذ',
      description: 'رفع طلب التنفيذ و/أو متابعة الإجراءات حتى إخراج ضد المنفذ ضده أمام محكمة التنفيذ.',
      icon: 'Gavel',
      buttonText: 'ابدأ طلب تنفيذ',
      isPrimary: true,
      whatsappMessage: 'مرحباً، أرغب في البدء بإجراءات طلب تنفيذ.'
    },
    {
      id: 5,
      title: 'العقود و الاتفاقيات',
      description: 'العقد شريعة المتعاقدين، صياغة ومراجعة العقود والاتفاقيات ودراسة العقود والبحث في إمكانية فسخها.',
      icon: 'FileText',
      buttonText: 'اطلب صياغة عقد',
      isPrimary: true,
      whatsappMessage: 'مرحباً، أرغب في طلب صياغة/مراجعة عقد.'
    },
    {
      id: 6,
      title: 'كتابات قانونية',
      description: 'صياغة اللوائح والمذكرات الجوابية الاعتراضية وصحائف الدعوى والنقض والالتماس وغيرها من الخطابات بطريقة قانونية سليمة.',
      icon: 'PenTool',
      buttonText: 'اطلب صياغة لائحة',
      isPrimary: true,
      whatsappMessage: 'مرحباً، أرغب في طلب خدمة كتابة قانونية.'
    },
    {
      id: 7,
      title: 'الاستشارات القانونية',
      description: 'استشارات متخصصة للأفراد والشركات لدعم القرارات وحماية المصالح.',
      icon: 'Briefcase',
      buttonText: 'استشر الآن',
      isPrimary: false,
      whatsappMessage: 'مرحباً، أرغب في طلب استشارة قانونية.'
    },
    {
      id: 8,
      title: 'الامتثال والحوكمة',
      description: 'تصميم سياسات وأنظمة امتثال متكاملة تعزز الشفافية.',
      icon: 'ShieldCheck',
      buttonText: 'طلب خدمة شركات',
      isPrimary: false,
      whatsappMessage: 'مرحباً، أرغب في الاستفسار عن خدمات الامتثال والحوكمة.'
    },
    {
      id: 9,
      title: 'التوثيق والإفراغ',
      description: 'خدمات التوثيق العقاري والإفراغ بكفاءة عالية ووفق الإجراءات النظامية.',
      icon: 'FileCheck',
      buttonText: 'احجز موعد توثيق',
      isPrimary: false,
      whatsappMessage: 'مرحباً، أرغب في حجز موعد لخدمة توثيق/إفراغ.'
    },
    {
      id: 10,
      title: 'الشركات والاستثمار',
      description: 'خدمات تأسيس الشركات والاستشارات الاستثمارية وفق الأنظمة السعودية.',
      icon: 'Building2',
      buttonText: 'ابدأ مشروعك',
      isPrimary: false,
      whatsappMessage: 'مرحباً، أرغب في الاستفسار عن خدمات تأسيس الشركات والاستثمار.'
    },
  ] as Service[],
  otherServicesTitle: "خدمات إضافية",
  statsTitle: "أرقام تتحدث عن نفسها",
  stats: [
    { id: 1, label: 'قضية تم إنجازها بنجاح', value: 500, suffix: '+', icon: 'Scale' },
    { id: 2, label: 'عميل راضٍ عن خدماتنا', value: 300, suffix: '+', icon: 'Star' },
    { id: 3, label: 'عقد واتفاقية تم صياغتها', value: 800, suffix: '+', icon: 'FileText' },
    { id: 4, label: 'عاماً من الخبرة القانونية', value: 15, suffix: '+', icon: 'Trophy' },
  ] as Stat[],
  foundersTitle: "فريق القيادة",
  foundersSubtitle: "نخبة من الخبراء القانونيين",
  founders: [
    {
      id: 'rami-baqader',
      name: 'أ. رامي محمد باقادر',
      title: 'محامٍ وموثق معتمد',
      description: 'عضو هيئة المحامين السعوديين، خبرة عملية تتجاوز 12 عاماً.',
      image: '/creator-ramy.jpg',
      bio: 'أ. رامي محمد باقادر، محامٍ وموثق معتمد، يتمتع بخبرة واسعة في المجال القانوني تمتد لأكثر من 12 عاماً. عضو في هيئة المحامين السعوديين، وقد ساهم في تأسيس وتطوير العديد من الاستراتيجيات القانونية للشركات والأفراد. يتخصص في القضايا التجارية والتوثيق، ويعمل جاهداً لضمان حماية مصالح عملائه بأعلى معايير الاحترافية.',
    },
    {
      id: 'ashraf-weih',
      name: 'أ. أشرف عبدالرازق ويح',
      title: 'مستشار قانوني',
      description: 'محامٍ بالنقض (مصر)، مؤلف للعديد من المؤلفات القانونية، دكتور بكلية الحقوق.',
      image: '/creater-ashraf.jpg',
      bio: 'أ. أشرف عبدالرازق ويح، مستشار قانوني ومحامٍ بالنقض في مصر. حاصل على درجة الدكتوراه في الحقوق، وله العديد من المؤلفات القانونية التي تعد مراجع هامة في المجال. يمتلك خبرة أكاديمية وعملية عميقة، ويقدم استشارات قانونية دقيقة ومعمقة في مختلف التخصصات القانونية.',
    },
  ] as Founder[],
  clientsTitle: "ثقة عملائنا هي فخرنا",
  testimonials: [
    {
      id: 1,
      content: "خدمة احترافية وسرعة في الإنجاز لم أعهدها من قبل. فريق نظامي ساعدني في حل قضية عقارية معقدة.",
      author: "أ. محمد العتيبي",
      role: "قطاع العقارات",
      rating: 5,
    },
    {
      id: 2,
      content: "الدقة في صياغة العقود حمت شركتنا من مشاكل قانونية كبيرة. أنصح بالتعامل معهم.",
      author: "شركة القمم",
      role: "شركة تجارية",
      rating: 5,
    },
    {
      id: 3,
      content: "المستشار الذكي في الموقع ساعدني أفهم موقفي القانوني مبدئياً قبل حجز الاستشارة. تجربة ممتازة.",
      author: "سارة الأحمد",
      role: "عميل فردي",
      rating: 5,
    },
  ] as Testimonial[],
  footer: {
    desc: "شريكك القانوني الموثوق في المملكة العربية السعودية. نقدم حلولاً مبتكرة تجمع بين الخبرة العريقة والتقنية الحديثة.",
    quickLinks: "روابط سريعة",
    contact: "تواصل معنا",
    location: "مقر شركة نظامي - جدة",
    rights: "جميع الحقوق محفوظة © شركة نظامي 2025",
    privacy: "سياسة الخصوصية",
    terms: "شروط الاستخدام",
    bookCta: "احجز استشارتك الآن",
    bookMessage: "مرحباً، أرغب في حجز استشارة قانونية."
  },
  chat: {
    title: "المستشار الذكي",
    subtitle: "متصل (AI)",
    placeholder: "اكتب استفسارك هنا...",
    typing: "جاري الكتابة...",
    poweredBy: "مدعوم بواسطة Gemini AI",
    initialMessage: "أهلاً بك في نظامي، أنا مساعدك الرقمي تحت التدريب، كيف يمكنني توجيهك اليوم للخدمة الصحيحة؟"
  }
};

const EN_CONTENT = {
  nav: [
    { name: 'Home', href: '#hero' },
    { name: 'Services', href: '#services' },
    { name: 'Founders', href: '#founders' },
    { name: 'Clients', href: '#clients' },
    { name: 'Contact', href: '#footer' },
  ],
  hero: {
    title: "Nizami Firm.. Your Trusted Digital Legal Partner",
    subtitle: "Over 15 years of experience at your fingertips. We combine the legal elite with digital solutions to ensure compliance accuracy and execution speed, in line with Vision 2030.",
    cta1: "Request Service",
    cta2: "Browse Services",
    cta3: "Watch Video",
  },
  featuresTitle: "Why are we your first choice?",
  features: [
    {
      icon: 'ShieldCheck',
      title: 'Experience & Compliance',
      desc: 'A team of elite consultants, with solutions fully compatible with Vision 2030.'
    },
    {
      icon: 'Zap',
      title: 'Smart Solutions',
      desc: 'We offer fast and accurate services that help you make decisions in less time.'
    },
    {
      icon: 'Lock',
      title: 'Complete Privacy',
      desc: 'We adhere to the highest security and data protection standards to ensure your business confidentiality.'
    }
  ] as Feature[],
  servicesTitle: "Our Services",
  servicesSubtitle: "A comprehensive range of legal services designed to meet your needs with precision and professionalism",
  services: [
    {
      id: 1,
      title: 'Case Study',
      description: 'If your matter involves many details, contracts, proofs, and judgment deeds requiring study to reach the answers you need.',
      icon: 'ClipboardList',
      buttonText: 'Request Case Study',
      isPrimary: true,
      whatsappMessage: 'Hello, I would like to request a Case Study service.'
    },
    {
      id: 2,
      title: 'Session Attendance',
      description: 'If you are busy, had an emergency, or simply do not wish to attend the session... assign a lawyer to attend and plead for you.',
      icon: 'Users',
      buttonText: 'Book a Lawyer',
      isPrimary: true,
      whatsappMessage: 'Hello, I would like to book a lawyer for session attendance.'
    },
    {
      id: 3,
      title: 'Pleading & Power of Attorney',
      description: 'Appointing a lawyer to fully plead for you until the preliminary or final judgment and filing for execution when needed.',
      icon: 'Scale',
      buttonText: 'Hire a Lawyer',
      isPrimary: true,
      whatsappMessage: 'Hello, I would like to hire a lawyer for pleading.'
    },
    {
      id: 4,
      title: 'Execution Requests',
      description: 'Filing execution requests and/or following up procedures until enforcement against the debtor before the execution court.',
      icon: 'Gavel',
      buttonText: 'Start Execution',
      isPrimary: true,
      whatsappMessage: 'Hello, I would like to start an execution request.'
    },
    {
      id: 5,
      title: 'Contracts & Agreements',
      description: 'The contract is the law of the contractors. Drafting and reviewing contracts/agreements, studying contracts, and researching termination possibilities.',
      icon: 'FileText',
      buttonText: 'Request Drafting',
      isPrimary: true,
      whatsappMessage: 'Hello, I would like to request contract drafting/review.'
    },
    {
      id: 6,
      title: 'Legal Writing',
      description: 'Drafting regulations, response memos, objections, claim sheets, cassations, petitions, and other letters in a sound legal manner.',
      icon: 'PenTool',
      buttonText: 'Request Writing',
      isPrimary: true,
      whatsappMessage: 'Hello, I would like to request legal writing services.'
    },
    {
      id: 7,
      title: 'Legal Consultation',
      description: 'Specialized consultations for individuals and companies to support decisions and protect interests.',
      icon: 'Briefcase',
      buttonText: 'Consult Now',
      isPrimary: false,
      whatsappMessage: 'Hello, I would like to book a legal consultation.'
    },
    {
      id: 8,
      title: 'Compliance & Governance',
      description: 'Designing integrated compliance policies and systems that enhance transparency.',
      icon: 'ShieldCheck',
      buttonText: 'Corporate Service',
      isPrimary: false,
      whatsappMessage: 'Hello, I would like to inquire about Compliance & Governance services.'
    },
    {
      id: 9,
      title: 'Documentation & Notarization',
      description: 'Real estate documentation and notarization services with high efficiency and according to regulatory procedures.',
      icon: 'FileCheck',
      buttonText: 'Book Appointment',
      isPrimary: false,
      whatsappMessage: 'Hello, I would like to book an appointment for documentation/notarization.'
    },
    {
      id: 10,
      title: 'Companies & Investment',
      description: 'Company incorporation and investment consulting services according to Saudi regulations.',
      icon: 'Building2',
      buttonText: 'Start Project',
      isPrimary: false,
      whatsappMessage: 'Hello, I would like to inquire about Company Incorporation & Investment services.'
    },
  ] as Service[],
  otherServicesTitle: "Additional Services",
  statsTitle: "Numbers Speak for Themselves",
  stats: [
    { id: 1, label: 'Cases Successfully Completed', value: 500, suffix: '+', icon: 'Scale' },
    { id: 2, label: 'Satisfied Clients', value: 300, suffix: '+', icon: 'Star' },
    { id: 3, label: 'Contracts & Agreements Drafted', value: 800, suffix: '+', icon: 'FileText' },
    { id: 4, label: 'Years of Legal Experience', value: 15, suffix: '+', icon: 'Trophy' },
  ] as Stat[],
  foundersTitle: "Leadership Team",
  foundersSubtitle: "Elite Legal Experts",
  founders: [
    {
      id: 'rami-baqader',
      name: 'Mr. Rami Mohammed Baqader',
      title: 'Lawyer & Certified Notary',
      description: 'Member of the Saudi Bar Association, with over 12 years of practical experience.',
      image: '/creator-ramy.jpg',
      bio: 'Mr. Rami Mohammed Baqader is a certified lawyer and notary with over 12 years of extensive experience in the legal field. A member of the Saudi Bar Association, he has contributed to establishing and developing numerous legal strategies for companies and individuals. He specializes in commercial cases and notarization, striving to ensure his clients\' interests are protected with the highest standards of professionalism.',
    },
    {
      id: 'ashraf-weih',
      name: 'Mr. Ashraf Abdelrazaq Weih',
      title: 'Legal Advisor',
      description: 'Cassation Lawyer (Egypt), author of numerous legal publications, PhD in Law.',
      image: '/creater-ashraf.jpg',
      bio: 'Mr. Ashraf Abdelrazaq Weih is a Legal Advisor and Cassation Lawyer in Egypt. He holds a PhD in Law and has authored numerous legal publications that serve as important references in the field. He possesses deep academic and practical experience, providing accurate and in-depth legal consultations across various legal specializations.',
    },
  ] as Founder[],
  clientsTitle: "Our Clients' Trust is Our Pride",
  testimonials: [
    {
      id: 1,
      content: "Professional service and speed of execution I have never seen before. The Nizami team helped me solve a complex real estate case.",
      author: "Mr. Mohammed Al-Otaibi",
      role: "Real Estate Sector",
      rating: 5,
    },
    {
      id: 2,
      content: "Precision in contract drafting saved our company from major legal problems. I highly recommend dealing with them.",
      author: "Al-Qimam Company",
      role: "Trading Company",
      rating: 5,
    },
    {
      id: 3,
      content: "The Smart Advisor on the site helped me understand my legal position initially before booking a consultation. Excellent experience.",
      author: "Sarah Al-Ahmed",
      role: "Individual Client",
      rating: 5,
    },
  ] as Testimonial[],
  footer: {
    desc: "Your trusted legal partner in Saudi Arabia. We offer innovative solutions combining ancient expertise with modern technology.",
    quickLinks: "Quick Links",
    contact: "Contact Us",
    location: "Nizami Firm HQ - Jeddah",
    rights: "All rights reserved © Nizami Law Firm 2025",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    bookCta: "Book Consultation Now",
    bookMessage: "Hello, I would like to book a legal consultation."
  },
  chat: {
    title: "Smart Advisor",
    subtitle: "Online (AI)",
    placeholder: "Type your inquiry here...",
    typing: "Typing...",
    poweredBy: "Powered by Gemini AI",
    initialMessage: "Welcome to Nizami. I am your digital assistant in training. How can I guide you to the right service today?"
  }
};

export const CONTENT = {
  ar: AR_CONTENT,
  en: EN_CONTENT
};