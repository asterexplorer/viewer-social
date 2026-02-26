import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <div className={styles.footerWrapper} id="footer">
            <div className={styles.footerLinks}>
                <Link href="#" className={styles.footerLink}>About</Link>
                <Link href="#" className={styles.footerLink}>Help</Link>
                <Link href="#" className={styles.footerLink}>Press</Link>
                <Link href="#" className={styles.footerLink}>API</Link>
                <Link href="#" className={styles.footerLink}>Jobs</Link>
                <Link href="#" className={styles.footerLink}>Privacy</Link>
                <Link href="#" className={styles.footerLink}>Terms</Link>
            </div>
            <div className={styles.copyright}>
                © 2026 VIEWER BY ASTER. <Link href="/LICENSE" className={styles.licenseLink}>MIT Licensed</Link>
            </div>
        </div>
    );
};

export default Footer;
