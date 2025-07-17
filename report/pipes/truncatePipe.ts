export const truncate = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }
  return value.substr(0, maxLength) + '...';
};
