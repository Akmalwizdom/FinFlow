<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Financial Report - {{ now()->format('F Y') }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #4F46E5;
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            color: #4F46E5;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        .summary-grid {
            display: table;
            width: 100%;
            border-collapse: collapse;
        }
        .summary-row {
            display: table-row;
        }
        .summary-cell {
            display: table-cell;
            padding: 15px;
            border: 1px solid #e5e7eb;
            text-align: center;
            width: 33.33%;
        }
        .summary-cell .label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .summary-cell .value {
            font-size: 20px;
            font-weight: bold;
            color: #333;
        }
        .summary-cell.income .value {
            color: #10B981;
        }
        .summary-cell.expense .value {
            color: #EF4444;
        }
        .summary-cell.balance .value {
            color: #4F46E5;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background-color: #F3F4F6;
            color: #374151;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
        }
        td {
            font-size: 14px;
        }
        .text-right {
            text-align: right;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #9CA3AF;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Financial Report</h1>
        <p><strong>{{ $user->name }}</strong></p>
        <p>Period: {{ now()->parse($currentMonth)->format('F Y') }}</p>
        <p>Generated: {{ now()->format('d M Y, H:i') }}</p>
    </div>

    <div class="section">
        <div class="section-title">Financial Summary</div>
        <div class="summary-grid">
            <div class="summary-row">
                <div class="summary-cell income">
                    <div class="label">Total Income</div>
                    <div class="value">Rp {{ number_format($report['total_income'], 0, ',', '.') }}</div>
                </div>
                <div class="summary-cell expense">
                    <div class="label">Total Expense</div>
                    <div class="value">Rp {{ number_format($report['total_expense'], 0, ',', '.') }}</div>
                </div>
                <div class="summary-cell balance">
                    <div class="label">Remaining Balance</div>
                    <div class="value">Rp {{ number_format($report['remaining_balance'], 0, ',', '.') }}</div>
                </div>
            </div>
        </div>
    </div>

    @if(count($report['top_categories'] ?? []) > 0)
    <div class="section">
        <div class="section-title">Top Expense Categories</div>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th class="text-right">Amount</th>
                    <th class="text-right">Percentage</th>
                </tr>
            </thead>
            <tbody>
                @foreach($report['top_categories'] as $category)
                <tr>
                    <td>{{ $category['category'] }}</td>
                    <td class="text-right">Rp {{ number_format($category['amount'], 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($category['percentage'], 1) }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <div class="section">
        <div class="section-title">Spending Analysis</div>
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th class="text-right">Value</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Need Percentage</td>
                    <td class="text-right">{{ number_format($report['need_want_ratio']['need_percentage'], 1) }}%</td>
                </tr>
                <tr>
                    <td>Want Percentage</td>
                    <td class="text-right">{{ number_format($report['need_want_ratio']['want_percentage'], 1) }}%</td>
                </tr>
                @if($report['comparison_with_previous']['income_change'] !== null)
                <tr>
                    <td>Income vs Last Month</td>
                    <td class="text-right">
                        @if($report['comparison_with_previous']['income_change'] >= 0)
                            <span style="color: #10B981;">+{{ $report['comparison_with_previous']['income_change'] }}%</span>
                        @else
                            <span style="color: #EF4444;">{{ $report['comparison_with_previous']['income_change'] }}%</span>
                        @endif
                    </td>
                </tr>
                @endif
                @if($report['comparison_with_previous']['expense_change'] !== null)
                <tr>
                    <td>Expense vs Last Month</td>
                    <td class="text-right">
                        @if($report['comparison_with_previous']['expense_change'] >= 0)
                            <span style="color: #EF4444;">+{{ $report['comparison_with_previous']['expense_change'] }}%</span>
                        @else
                            <span style="color: #10B981;">{{ $report['comparison_with_previous']['expense_change'] }}%</span>
                        @endif
                    </td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>FinFlow - Personal Finance Tracker</p>
        <p>Report generated on {{ now()->format('d M Y') }}</p>
    </div>
</body>
</html>
