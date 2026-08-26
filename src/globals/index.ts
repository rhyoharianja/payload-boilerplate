import { Footer } from './Footer'
import { Header } from './Header'
import { SiteSettings } from './SiteSettings'

/** Global yang terdaftar di config. Urutannya menentukan urutan di sidebar. */
export const globals = [SiteSettings, Header, Footer]

export { Footer, Header, SiteSettings }
