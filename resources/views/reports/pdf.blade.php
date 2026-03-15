<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Financial Report - {{ now()->format('F Y') }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            padding: 40px;
            background: #ffffff;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0 0 8px 0;
            font-size: 26px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .header p {
            margin: 6px 0;
            color: #555;
            font-size: 13px;
        }
        .header .user-name {
            font-size: 15px;
            font-weight: 600;
            color: #2c3e50;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            color: #2c3e50;
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .summary-table th {
            background-color: #f8f9fa;
            color: #2c3e50;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            padding: 12px 15px;
            text-align: left;
            border: 1px solid #dee2e6;
            letter-spacing: 0.3px;
        }
        .summary-table td {
            padding: 12px 15px;
            border: 1px solid #dee2e6;
            font-size: 13px;
        }
        .summary-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .summary-table tr:hover {
            background-color: #f1f3f5;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .total-row {
            font-weight: 600;
            background-color: #e9ecef !important;
        }
        .positive {
            color: #28a745;
            font-weight: 600;
        }
        .negative {
            color: #dc3545;
            font-weight: 600;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #888;
            border-top: 1px solid #e0e0e0;
            padding-top: 15px;
        }
        .footer p {
            margin: 3px 0;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #2c3e50;
            padding: 12px 15px;
            margin-bottom: 20px;
            font-size: 12px;
        }
        .currency {
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Financial Report</h1>
        <p class="user-name"><strong>{{ $user->name }}</strong></p>
        <p>Reporting Period: {{ now()->parse($currentMonth)->format('F Y') }}</p>
        <p>Generated on: {{ now()->format('d F Y, H:i') }} WIB</p>
    </div>

    <div class="info-box">
        <strong>Report Overview:</strong> This document provides a comprehensive summary of your financial transactions for the period of {{ now()->parse($currentMonth)->format('F Y') }}, including income, expenses, and category breakdown.
    </div>

    <div class="section">
        <div class="section-title">Financial Summary</div>
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Amount (IDR)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Total Income</td>
                    <td class="text-right currency">Rp {{ number_format($report['total_income'], 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td>Total Expenses</td>
                    <td class="text-right currency">Rp {{ number_format($report['total_expense'], 0, ',', '.') }}</td>
                </tr>
                <tr class="total-row">
                    <td>Net Balance</td>
                    <td class="text-right currency {{ $report['remaining_balance'] >= 0 ? 'positive' : 'negative' }}">
                        Rp {{ number_format($report['remaining_balance'], 0, ',', '.') }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    @if(count($report['top_categories'] ?? []) > 0)
    <div class="section">
        <div class="section-title">Expense Breakdown by Category</div>
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th class="text-right">Amount (IDR)</th>
                    <th class="text-right">Percentage</th>
                </tr>
            </thead>
            <tbody>
                @foreach($report['top_categories'] as $index => $category)
                <tr>
                    <td>{{ $index + 1 }}. {{ $category['category'] }}</td>
                    <td class="text-right currency">Rp {{ number_format($category['amount'], 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format($category['percentage'], 1) }}%</td>
                </tr>
                @endforeach
                <tr class="total-row">
                    <td>Total Tracked Expenses</td>
                    <td class="text-right currency">Rp {{ number_format(collect($report['top_categories'])->sum('amount'), 0, ',', '.') }}</td>
                    <td class="text-right">{{ number_format(collect($report['top_categories'])->sum('percentage'), 1) }}%</td>
                </tr>
            </tbody>
        </table>
    </div>
    @endif

    <div class="section">
        <div class="section-title">Monthly Performance Comparison</div>
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th class="text-right">Change vs Previous Month</th>
                    <th class="text-right">Status</th>
                </tr>
            </thead>
            <tbody>
                @if($report['comparison_with_previous']['income_change'] !== null)
                <tr>
                    <td>Income Performance</td>
                    <td class="text-right">
                        @if($report['comparison_with_previous']['income_change'] >= 0)
                            <span class="positive">+{{ number_format($report['comparison_with_previous']['income_change'], 1) }}%</span>
                        @else
                            <span class="negative">{{ number_format($report['comparison_with_previous']['income_change'], 1) }}%</span>
                        @endif
                    </td>
                    <td class="text-center">
                        @if($report['comparison_with_previous']['income_change'] >= 0)
                            ▲
                        @else
                            ▼
                        @endif
                    </td>
                </tr>
                @endif
                @if($report['comparison_with_previous']['expense_change'] !== null)
                <tr>
                    <td>Expense Performance</td>
                    <td class="text-right">
                        @if($report['comparison_with_previous']['expense_change'] >= 0)
                            <span class="negative">+{{ number_format($report['comparison_with_previous']['expense_change'], 1) }}%</span>
                        @else
                            <span class="positive">{{ number_format($report['comparison_with_previous']['expense_change'], 1) }}%</span>
                        @endif
                    </td>
                    <td class="text-center">
                        @if($report['comparison_with_previous']['expense_change'] >= 0)
                            ▲
                        @else
                            ▼
                        @endif
                    </td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>

    @if(count($report['daily_breakdown'] ?? []) > 0)
    <div class="section">
        <div class="section-title">Daily Transaction Summary</div>
        <table class="summary-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th class="text-right">Income (IDR)</th>
                    <th class="text-right">Expenses (IDR)</th>
                    <th class="text-right">Net (IDR)</th>
                </tr>
            </thead>
            <tbody>
                @foreach(array_slice($report['daily_breakdown'], 0, 10) as $day)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($day['date'])->format('d M Y') }}</td>
                    <td class="text-right currency">Rp {{ number_format($day['income'], 0, ',', '.') }}</td>
                    <td class="text-right currency">Rp {{ number_format($day['expense'], 0, ',', '.') }}</td>
                    <td class="text-right currency {{ ($day['income'] - $day['expense']) >= 0 ? 'positive' : 'negative' }}">
                        Rp {{ number_format($day['income'] - $day['expense'], 0, ',', '.') }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @if(count($report['daily_breakdown']) > 10)
        <p style="font-size: 12px; color: #666; margin-top: 10px; font-style: italic;">
            * Showing first 10 days out of {{ count($report['daily_breakdown']) }} total transaction days
        </p>
        @endif
    </div>
    @endif

    <div class="footer">
        <p><strong>FinFlow - Personal Finance Management System</strong></p>
        <p>This is a computer-generated report. No signature required.</p>
        <p>Report ID: {{ strtoupper(uniqid('RPT-')) }} | Generated: {{ now()->format('d-M-Y H:i:s') }}</p>
    </div>
</body>
</html>
