import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" });

const PLANS = [
  {
    id: "starter",
    name: "Solver Starter",
    monthly: 4900,
    description:
      "Monthly strategy check-in, email support, small updates & bug fixes, 1 active request at a time.",
  },
  {
    id: "pro",
    name: "Solver Pro",
    monthly: 20000,
    description:
      "Everything in Starter + priority support, weekly sync call, 3 active requests, landing & funnel tweaks.",
  },
  {
    id: "ultra",
    name: "Solver Ultra",
    monthly: 40000,
    description:
      "Everything in Pro + dedicated Solver team lead, same-day response, unlimited requests, custom automation & integrations.",
  },
];

const results = {};

for (const plan of PLANS) {
  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: { plan_id: plan.id },
  });

  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: plan.monthly,
    currency: "usd",
    recurring: { interval: "month" },
    metadata: { plan_id: plan.id, billing_period: "monthly" },
    nickname: `${plan.name} – Monthly`,
  });

  const annualUnit = Math.round(plan.monthly * 12 * 0.8); // 20% off, billed yearly
  const annualPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: annualUnit,
    currency: "usd",
    recurring: { interval: "year" },
    metadata: { plan_id: plan.id, billing_period: "annually" },
    nickname: `${plan.name} – Annual (20% off)`,
  });

  results[plan.id] = {
    product_id: product.id,
    monthly_price_id: monthlyPrice.id,
    annual_price_id: annualPrice.id,
  };
  console.log(`✅ ${plan.name}: monthly=${monthlyPrice.id} annual=${annualPrice.id}`);
}

console.log("\n=== JSON ===");
console.log(JSON.stringify(results, null, 2));
