import { PrintedFiguresPage } from "../pages/PrintedFiguresPage";
import { withMaintenance } from "@/helpers/routeHelpers";
import { ROUTES } from "@/constants/routeConstants";
import type { RouteObject } from "react-router-dom";



export const printedFiguresRoutes: RouteObject[] = [
    { path: ROUTES.PRINTED_FIGURES, element: withMaintenance(<PrintedFiguresPage />) },
    
    
    
];
