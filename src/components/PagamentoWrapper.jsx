import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Pagamento from './Pagamento';

// Substitua pela sua chave pública do Stripe
const stripePromise = loadStripe('pk_test_51Q2vbsBGBgdae3VE253hWrzJikRaIK6tYOlWOeCKkFt6GArcJUZrNoaBc21vXz1F0sxPc3ErEqskwvQFf2EIDov200ZtBcleBd');

const PagamentoWrapper = () => (
  <Elements stripe={stripePromise}>
    <Pagamento />
  </Elements>
);

export default PagamentoWrapper;