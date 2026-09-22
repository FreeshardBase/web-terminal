import moment from "moment/moment";

export function formatDate(value) {
  return moment(String(value)).format('YYYY-MM-DD');
}
