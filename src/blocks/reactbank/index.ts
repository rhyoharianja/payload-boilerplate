import { BenefitsBlock } from './Benefits'
import {
  BlogGridBlock,
  BlogPreviewBlock,
  CreditTiersBlock,
  DocumentsBlock,
  PageHeroBlock,
} from './content'
import { FaqBlock } from './Faq'
import {
  CallToActionBlock,
  CardGridBlock,
  CodeSampleBlock,
  ContactPanelBlock,
  FeatureGridBlock,
  PricingPlansBlock,
  ProseBlock,
  VideoFeatureBlock,
} from './generic'
import {
  CalculatorTabsBlock,
  EligibilityFormBlock,
  FxRatesBlock,
  HeroBlock,
  HeroLightBlock,
  LoanCalculatorBlock,
  LoanFormBlock,
  SavingsCalculatorBlock,
  TransactionHistoryBlock,
} from './finance'
import {
  AboutBlock,
  AdvantagesBlock,
  AwardsBlock,
  CaseStudiesBlock,
  ClientReviewsBlock,
  GlobalInfrastructureBlock,
  IntegrationsBlock,
  LoanCategoriesBlock,
  SecurityProtocolsBlock,
  ServicesGridBlock,
  StepFlowBlock,
  TeamBlock,
  TechStackBlock,
  TrustIndicatorsBlock,
} from './marketing'
import { TestimonialsBlock } from './Testimonials'

/**
 * Block yang dirender oleh komponen section milik NEXT-REACTBANK, dikelompokkan
 * mengikuti alur halaman.
 *
 * Kelompoknya didefinisikan SEKALI di sini, lalu daftar datar `reactbankBlocks`
 * diturunkan darinya. Menyimpan dua daftar berarti urutan di form Payload dan
 * kelompok di katalog Puck bisa berbeda, dan yang menyimpang duluan adalah yang
 * jarang dibuka.
 *
 * Storybook frontend TIDAK dipakai sebagai sumber kelompok: kategorinya
 * ("Fondasi", "Masukan", …) menggambarkan primitif UI, dan seluruh 29 section
 * di sana masuk satu entri "Blok Halaman". Yang berguna bagi penyusun halaman
 * adalah urutan pemakaian, bukan taksonomi komponen.
 */
export const blockGroups = [
  {
    blocks: [HeroBlock, HeroLightBlock, PageHeroBlock],
    key: 'pembuka',
    title: 'Pembuka halaman',
  },
  {
    blocks: [
      AboutBlock,
      BenefitsBlock,
      ServicesGridBlock,
      AdvantagesBlock,
      StepFlowBlock,
      IntegrationsBlock,
      FeatureGridBlock,
      CardGridBlock,
      PricingPlansBlock,
    ],
    key: 'cerita',
    title: 'Cerita produk',
  },
  {
    blocks: [
      TrustIndicatorsBlock,
      TestimonialsBlock,
      ClientReviewsBlock,
      CaseStudiesBlock,
      AwardsBlock,
      TeamBlock,
      SecurityProtocolsBlock,
      TechStackBlock,
      GlobalInfrastructureBlock,
    ],
    key: 'bukti',
    title: 'Bukti & kepercayaan',
  },
  {
    blocks: [
      CalculatorTabsBlock,
      LoanCalculatorBlock,
      SavingsCalculatorBlock,
      FxRatesBlock,
      EligibilityFormBlock,
      LoanFormBlock,
      ContactPanelBlock,
      CodeSampleBlock,
      VideoFeatureBlock,
      CallToActionBlock,
    ],
    key: 'alat',
    title: 'Alat hitung & formulir',
  },
  {
    blocks: [
      LoanCategoriesBlock,
      CreditTiersBlock,
      TransactionHistoryBlock,
      DocumentsBlock,
      BlogPreviewBlock,
      BlogGridBlock,
      FaqBlock,
      ProseBlock,
    ],
    key: 'daftar',
    title: 'Daftar & tabel',
  },
]

/** Daftar datar untuk field `blocks` Payload; urutannya mengikuti kelompok. */
export const reactbankBlocks = blockGroups.flatMap((group) => group.blocks)

/**
 * Bentuk `categories` yang diminta Puck.
 *
 * `defaultExpanded` hanya untuk kelompok pertama: tiga puluh butir yang terbuka
 * semua sama saja dengan daftar panjang yang tadi ingin dihindari.
 */
export const puckCategories = Object.fromEntries(
  blockGroups.map((group, index) => [
    group.key,
    {
      components: group.blocks.map((block) => block.slug),
      defaultExpanded: index === 0,
      title: group.title,
    },
  ]),
)

export {
  AboutBlock,
  CallToActionBlock,
  CardGridBlock,
  CodeSampleBlock,
  ContactPanelBlock,
  FeatureGridBlock,
  PricingPlansBlock,
  ProseBlock,
  VideoFeatureBlock,
  AdvantagesBlock,
  AwardsBlock,
  BenefitsBlock,
  BlogGridBlock,
  BlogPreviewBlock,
  CalculatorTabsBlock,
  CaseStudiesBlock,
  ClientReviewsBlock,
  CreditTiersBlock,
  DocumentsBlock,
  EligibilityFormBlock,
  FaqBlock,
  FxRatesBlock,
  GlobalInfrastructureBlock,
  HeroBlock,
  HeroLightBlock,
  IntegrationsBlock,
  LoanCalculatorBlock,
  LoanCategoriesBlock,
  LoanFormBlock,
  PageHeroBlock,
  SavingsCalculatorBlock,
  SecurityProtocolsBlock,
  ServicesGridBlock,
  StepFlowBlock,
  TeamBlock,
  TechStackBlock,
  TestimonialsBlock,
  TransactionHistoryBlock,
  TrustIndicatorsBlock,
}
