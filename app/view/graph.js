// グラフ描画用の株価データセット
var _DataSets = [];
// グラフのY軸設定
var _YAxes = [];
// 企業シンボルを格納する配列
var _symbols = [];
// グラフを描画するチャートオブジェクト
var _myChart;

// ダッシュボードに登録済の企業について、株価データを更新
function UpdateChart(period){

	clear_canvas();

	clear_datasets();
	
	cleate_canvas();

	for(symbol of _symbols) {

		// 株価時系列データの取得
		var stock_price = GetStockPrice(symbol, period);
		add_data(symbol, period, stock_price);
	}

	var ctx = canvas.getContext("2d");

	create_chart(ctx);

}

// グラフの描画
function AddToChart(symbol, period, stock_price) {

	clear_canvas();

	cleate_canvas();

	add_data(symbol, period, stock_price);

	var ctx = canvas.getContext("2d");

	create_chart(ctx);

}

// 選択企業をグラフから削除
function DeleteFromChart(symbol) {

	delete_data(symbol);

	clear_canvas();
	
	if(_symbols.length!=0) {
		cleate_canvas();

		var ctx = canvas.getContext("2d");
		create_chart(ctx);
	}
}

// データセット・グラフ・ダッシュボード・検索結果をクリア
function ResetAll() {

	clear_dashboard();
	clear_searchresult();
	clear_canvas();

	clear_datasets();
	_companytable = null;
	_symbols = [];
}

// 株価データをデータセットに追加
function add_data(symbol, period, stock_price) {
	
	// 取得したデータをデータセットに格納
	_DataSets.push({
		label : symbol,
		data : stock_price,
		yAxisID : symbol,
		lineTension : 0,
		fill : false,
		pointRadius : period=='1m' ? 3 : 0 ,
	});

	// 時系列データの最大値、最小値を取得
	smax = Math.max.apply(null, stock_price.map(function(o){return o.y;}));
	smin = Math.min.apply(null, stock_price.map(function(o){return o.y;}));

	// グラフのY軸の設定
	_YAxes.push({
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
}

// データセットから選択企業の株価データを削除
function delete_data(symbol) {
	var idx = 0;
	for (i=0; i<_DataSets.length; i++) {
		if(_DataSets[i].label.toLowerCase()==symbol.toLowerCase())
			idx = i;
	}
	_symbols.splice(idx,1);
	_DataSets.splice(idx,1);
	_YAxes.splice(idx,1);
}

// データセットのクリア
function clear_datasets() {
	_DataSets = [];
	_YAxes = [];
}

// キャンバスの生成、期間ボタンの表示
function cleate_canvas(){

	document.getElementById("period_buttons").hidden = false;

	var canvas = document.createElement('canvas');
	canvas.id = "canvas";
	document.getElementById('myChart_canvas').appendChild(canvas);
}

// キャンバスの削除、期間ボタンの非表示
function clear_canvas() {

	document.getElementById("period_buttons").hidden = true;

	var canvas = document.getElementById("canvas");
	if(canvas) {
		document.getElementById('myChart_canvas').removeChild(canvas);
		canvas.remove();
	}
	if(_myChart) {
		_myChart.destroy();
	}
}

// グラフの作成
function create_chart(ctx) {

	// Chart オブジェクトを作成、諸々の設定を行う
	_myChart = new Chart(ctx, {
		// 折れ線グラフ
		type : 'line',
		data : {
			datasets : _DataSets
		},
		options : {
			//animation : false,
			responsive : true,
			maintainAspectRatio : true,
			scales : {
				xAxes : [{
					type : 'time',
					//time : _time,
					// 時刻に合わせて、横軸の目盛間隔を調整する
					distribution : 'linear',
					ticks : {
						source : 'auto'
					}
				}],
				yAxes : _YAxes
		}}
	});
}

