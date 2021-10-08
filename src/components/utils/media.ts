import { useMediaQuery } from "@mui/material";

export const useDektopLayout = (): boolean => useMediaQuery('(min-width:600px)');