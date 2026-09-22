import moment from "moment/moment";

export function formatDateTime(value) {
  return moment(String(value)).format('YYYY-MM-DD HH:mm');
}
