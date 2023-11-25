import moment from 'moment';

export function formatDate(_, __, date) {
  return moment(date).format('YYYY-MM-DD hh:mm');
}
