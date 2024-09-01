export const orderByParser = (
  sort?: string[],
): { [key: string]: 'asc' | 'desc' }[] => {
  if (!sort) return []

  return sort?.map((s) => {
    const str = s.split(`:`)
    const ordering: 'asc' | 'desc' =
      str[1] && [`asc`, `desc`].includes(str[1].toLowerCase())
        ? (str[1] as 'asc' | 'desc')
        : `asc`

    return {
      [str[0]]: ordering,
    }
  })
}
