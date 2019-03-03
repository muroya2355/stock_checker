// 株価データセットを格納する配列（[{時刻, 株価},...]）
var DataSets = [];
// グラフのY軸設定
var YAxes = [];
// 企業シンボルを格納する配列
var symbols = [];
// グラフを描画するチャートオブジェクト
var myChart;

// 株価の取得
function GetStockPrice(symbol) {

	// {時刻, 株価} を格納する配列
	var stock_price = [];

	// リクエストの生成
	var xmlHttpRequest = new XMLHttpRequest();
	if (xmlHttpRequest) {
		xmlHttpRequest.onreadystatechange = function(){
			// 正常なレスポンスが返ってきたときに
			if( this.readyState == 4 && this.status == 200 ){
				if( this.response ){
					// レスポンスをJSON形式でパース
					var list = JSON.parse(this.response);
					try {
						// 各株価データに対し
						for (i=0; i<list.length; i++) {
							// 株価が正常な値の時に（株価が取得できていない時がある）
							if (list[i].average > 10) {
								// {時刻, 株価} の組を配列に格納
								stock_price.push({
									t : moment(list[i].date+" "+list[i].minute, "YYYYMMDD hh:mm"),
									y : list[i].average
								});
							}
						}
					} catch (e) {
						console.log(e);
					}
	}}}}

	// API にアクセスし*非同期で*データを取得（非推奨）
	xmlHttpRequest.open( 'GET', 'https://api.iextrading.com/1.0/stock/'+symbol.toLowerCase()+'/chart/1d', false );
	xmlHttpRequest.send( null );

	// 配列を返す
	return stock_price;
}

// "Display stock price" ボタンを押したときに、株価グラフの描画
document.getElementById("form-button").onclick = function() {

	// キャンバスのコンテキストの取得
	var ctx = document.getElementById("myChart").getContext("2d");

	// フォームからシンボルを取得、配列に格納
	var symbol = document.getElementById("symbol").value
	symbols.push(symbol);

	// 株価時系列データの取得
	stock_price = GetStockPrice(symbol);
	//console.log(stock_price);

	// 取得したデータをデータセットに格納
	DataSets.push({
		label : symbol,
		data : stock_price,
		fill : false,
		yAxisID : symbol,
	});

	// 時系列データの最大値、最小値を取得
	smax = Math.max.apply(null, stock_price.map(function(o){return o.y;}));
	smin = Math.min.apply(null, stock_price.map(function(o){return o.y;}));

	// グラフのY軸の設定
	YAxes.push({
		id : symbol,
		type : 'linear',
		ticks : {
			// スケーリングの設定。株価の最大値を上端、最小値を下端になるように調整する
			// （上下にマージンを持たせる）
			max : smax+0.1*(smax-smin),
			min : smin-0.1*(smax-smin),
			// 株価の目盛は表示しない
			callback : function(value, index, values) {
				return null;
			}
		},
		offset : true,
		maxRotation : 45,
		// 目盛戦の非表示
		gridLines : {
			drawOnChartArea : false,
		}
	})

	// 既にグラフが描画されているときには
	if (myChart) {
		// データセットを置き換え、再描画する
		myChart.data.datasets = DataSets;
		myChart.options.scales.yAxes = YAxes;
		myChart.update();

	} else {
		// グラフを初めて描画するとき
		// Chart オブジェクトを作成、諸々の設定を行う
		myChart = new Chart(ctx, {
			// 折れ線グラフ
			type : 'line',
			data : {
				datasets : DataSets
			},
			options : {
				scales : {
					xAxes : [{
						type : 'time',
						time : {
							unit : 'minute',
							displayFormats : {
								minute : 'hh:mm a'
							}
						},
						// 時刻に合わせて、横軸の目盛間隔を調整する
						distribution : 'linear',
						ticks : {
							source : 'auto'
						}
					}],
					yAxes : YAxes
			}}
		});
	}

}

// リセットボタンを押したときに、データセット、グラフをクリアする
document.getElementById("reset-button").onclick = function() {
	symbol = [];

	DataSets = [];
	YAxes = [];

	myChart.clear();

	document.getElementById("symbol").value = "";
}