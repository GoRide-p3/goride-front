export const parseLocalDate = (dateString: string) =>
  new Date(`${dateString}T00:00:00`);

export const formatLocalDate = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions,
) => parseLocalDate(dateString).toLocaleDateString("pt-BR", options);

export const formatISODate = (
  isoString: string,
  options?: Intl.DateTimeFormatOptions,
) => new Date(isoString).toLocaleDateString("pt-BR", options);