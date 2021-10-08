export const shortAddress = (address: string, visibleChars: number = 4): string => {
    const length = address.length
    if (length <= 2 * visibleChars + 2) return address;
    return "0x" + address.slice(2, 2 + visibleChars) + '...' + address.slice(address.length - visibleChars)
}