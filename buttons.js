// 株価表示の期間
var _period = '1m';
// 前回株価表示した期間
var _period_prev;

// "Display stock price" ボタンを押したときに、株価の取得、グラフの描画など
document.getElementById("form-button").onclick = function() {

	// フォームからシンボルを取得、配列に格納
	var symbol = document.getElementById("symbol").value
	// 最新株価の取得
	var price = GetLatestPrice(symbol);

	_symbols.push(symbol);

	// 選択企業をダッシュボードに追加
	AddToDashboard(symbol, price);

	if(_period=="1d") {
		// 株価時系列データの再取得、グラフの描画
		UpdateChart(_period);
	} else {
		// 株価時系列データの取得
		stock_price = GetStockPrice(symbol, _period);

		// グラフの描画
		AddToChart(symbol, _period, stock_price);
	}
}

// リセットボタンを押したときに、データセット・グラフをクリアする
document.getElementById("reset-button").onclick = function() {
	ResetAll();
}

// 各期間のボタンを押したときに、タイムスケールの更新
document.getElementById("p1d").onclick = function() {

	_period_prev = _period;
	_period = "1d";
	UpdateChart(_period);
}
document.getElementById("p1m").onclick = function() {

	_period_prev = _period;
	_period = "1m";
	UpdateChart(_period);
}
document.getElementById("p3m").onclick = function() {

	_period_prev = _period;
	_period = "3m";
	UpdateChart(_period);
}
document.getElementById("p6m").onclick = function() {

	_period_prev = _period;
	_period = "6m";
	UpdateChart(_period);
}
document.getElementById("p1y").onclick = function() {

	_period_prev = _period;
	_period = "1y";
	UpdateChart(_period);
}
document.getElementById("p2y").onclick = function() {

	_period_prev = _period;
	_period = "2y";
	UpdateChart(_period);
}
document.getElementById("p5y").onclick = function() {

	_period_prev = _period;
	_period = "5y";
	UpdateChart(_period);
}