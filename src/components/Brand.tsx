import { Link } from 'react-router-dom';
import onDark from '../assets/seyo-wordmark-miami-dark.svg';
import onLight from '../assets/seyo-wordmark-miami-light.svg';
import { APP_NAME } from '../lib/plans';

/** The SeYo wordmark, linked home. The final "o" is the seal. `tone` is the background it sits on. */
export default function Brand({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <Link to="/" className="lp__brand" aria-label={`${APP_NAME} home`}>
      <img src={tone === 'dark' ? onDark : onLight} alt={APP_NAME} className="lp__mark" />
    </Link>
  );
}
