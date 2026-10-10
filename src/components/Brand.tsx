import { Link } from 'react-router-dom';
import wordmark from '../assets/okunami-wordmark.png';
import { APP_NAME } from '../lib/plans';

/** The OKUNAMI wordmark, linked home. The artwork is made for dark backgrounds, and every page that shows it is dark. */
export default function Brand(_props: { tone?: 'light' | 'dark' }) {
  return (
    <Link to="/" className="lp__brand" aria-label={`${APP_NAME} home`}>
      <img src={wordmark} alt={APP_NAME} className="lp__mark" />
    </Link>
  );
}
