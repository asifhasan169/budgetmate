import { Expense, MonthlyBudget, SmartInsight, UserProfile } from '../types';

export class AIService {
  public static generateInsights(
    expenses: Expense[],
    budgets: MonthlyBudget[],
    users: UserProfile[],
    currencySymbol: string = '₹'
  ): SmartInsight[] {
    const insights: SmartInsight[] = [];

    if (!expenses.length) {
      return [
        {
          id: 'ins-empty',
          type: 'tip',
          title: 'Start Logging Household Expenses',
          message: 'Add your first shared expense to unlock smart budget predictions and roommate fair-share settlement math.'
        }
      ];
    }

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 1. Budget Pace & Alerts
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    users.forEach(user => {
      const userBudget = budgets.find(b => b.userId === user.id && b.month === currentMonth && b.year === currentYear)?.amount || 0;
      
      // Calculate how much user has spent / owes
      const userSpent = expenses.reduce((sum, e) => {
        const detail = e.splitDetails?.find(d => d.userId === user.id);
        return sum + (detail ? detail.amount : (e.amount / users.length));
      }, 0);

      if (userBudget > 0) {
        const percentUsed = (userSpent / userBudget) * 100;
        if (percentUsed >= 90) {
          insights.push({
            id: `ins-budget-alert-${user.id}`,
            type: 'warning',
            title: `${user.name} is at ${Math.round(percentUsed)}% of Monthly Budget`,
            message: `${user.name} has allocated ${currencySymbol}${userSpent.toFixed(2)} out of ${currencySymbol}${userBudget.toFixed(2)}. Consider cutting non-essential dining/shopping for the rest of the month.`,
            impactAmount: Math.round(userSpent - userBudget)
          });
        } else if (percentUsed <= 60 && now.getDate() > 20) {
          insights.push({
            id: `ins-budget-good-${user.id}`,
            type: 'positive',
            title: `${user.name} is Well Below Budget Target`,
            message: `Great discipline! ${user.name} is on track to save around ${currencySymbol}${(userBudget - userSpent).toFixed(2)} this month.`,
            impactAmount: Math.round(userBudget - userSpent)
          });
        }
      }
    });

    // 2. Category Concentration Anomaly
    const categoryTotals: Record<string, { name: string; amount: number }> = {};
    expenses.forEach(e => {
      if (!categoryTotals[e.categoryId]) {
        categoryTotals[e.categoryId] = { name: e.categoryName, amount: 0 };
      }
      categoryTotals[e.categoryId].amount += e.amount;
    });

    const sortedCategories = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);
    if (sortedCategories.length > 0 && totalSpent > 0) {
      const topCat = sortedCategories[0];
      const topPct = (topCat.amount / totalSpent) * 100;

      if (topPct > 40 && topCat.name !== 'Rent') {
        insights.push({
          id: 'ins-top-cat',
          type: 'warning',
          title: `High Spending in ${topCat.name} (${Math.round(topPct)}%)`,
          message: `${topCat.name} accounts for ${currencySymbol}${topCat.amount.toFixed(2)} of your total household expenditures. Planning meal preps or shopping in bulk could save ~15-20%.`,
          category: topCat.name
        });
      }
    }

    // 3. Payer Balance Anomaly (Who Paid More)
    const paidByMap: Record<string, number> = {};
    users.forEach(u => (paidByMap[u.id] = 0));
    expenses.forEach(e => {
      paidByMap[e.paidByUserId] = (paidByMap[e.paidByUserId] || 0) + e.amount;
    });

    if (users.length >= 2) {
      const u1 = users[0];
      const u2 = users[1];
      const p1 = paidByMap[u1.id] || 0;
      const p2 = paidByMap[u2.id] || 0;
      const diff = Math.abs(p1 - p2);

      if (diff > 300) {
        const higherPayer = p1 > p2 ? u1 : u2;
        const lowerPayer = p1 > p2 ? u2 : u1;
        insights.push({
          id: 'ins-payer-imbalance',
          type: 'prediction',
          title: `Fronted Expenses Imbalance: ${higherPayer.name}`,
          message: `${higherPayer.name} has fronted ${currencySymbol}${diff.toFixed(2)} more out-of-pocket than ${lowerPayer.name}. Settle up mid-month to keep balances even.`,
          actionLabel: 'Settle Balance'
        });
      }
    }

    // 4. Smart Savings Tip
    insights.push({
      id: 'ins-saving-tip',
      type: 'tip',
      title: 'Smart Roommate Savings Recommendation',
      message: 'Setting up automated recurring split bills for Rent and WiFi avoids manual math and prevents forgotten late-month settlements.'
    });

    return insights;
  }
}
