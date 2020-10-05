/** @format */

module.exports = {
  formatDate: function formatDate(date) {
    const formattedDate = new Date(date);
    const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(formattedDate);
    const month = new Intl.DateTimeFormat("en", { month: "short" }).format(formattedDate);
    const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(formattedDate);

    return `${day} ${month} ${year}`;
  },
};
