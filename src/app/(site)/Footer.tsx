import Image from 'next/image';
import Link from 'next/link';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Templates', href: '/templates' },
    { label: 'About', href: '/about' },
  ],
  Support: [
    { label: 'FAQ', href: '/contact' },
    { label: 'Support', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export default function Footer() {
  return (
<footer className="border-t border-gray-200 bg-primary">
  <div className="width-padding mx-auto py-12">
    <div className="grid md:grid-cols-4 gap-8 mb-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Image
            src="https://res.cloudinary.com/dggey8rb6/image/upload/v1781519413/download_e9qskl.png"
            alt="Cards AI Logo"
            width={48}
            height={48}
            className="object-contain p-2 bg-primary-foreground rounded-xl"
          />
          <span className="text-xl font-bold text-primary-foreground">Cards AI</span>
        </div>
        <p className="text-primary-foreground mt-2 text-sm leading-relaxed">
          Precision-crafted greetings for the modern age.
        </p>
      </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-semibold text-primary-foreground mb-4">{section}</h4>
              <ul className="space-y-2 text-sm text-primary-foreground">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-primary-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-8">
          <p className="text-primary-foreground text-sm">
            © {new Date().getFullYear()} Cards AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}