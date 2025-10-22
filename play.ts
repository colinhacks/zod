import * as z from "zod";

// import { z } from 'zod/v4';

const OfferPriceCurrency = z.literal(["EUR", "USD"]);

const OfferPricesSchema = z.partialRecord(OfferPriceCurrency, z.number());

const testObject = { USD: 3 };

const r = OfferPricesSchema.parse(testObject);

console.log(r);
