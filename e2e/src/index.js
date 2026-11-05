import { label } from "@/components/Button";
import { format } from "@/utils/format";
import { fixtureId } from "@/utils/id";
import { apiClient } from "@utils/api/client";
import fs from "fs";
import debug from "debug";
import brand from "brand.txt";

export const app = {
    label: format(label),
    fixtureId,
    apiClient,
    brand,
    fs: typeof fs.readFileSync,
    debug: typeof debug,
};
