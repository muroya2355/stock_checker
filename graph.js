// 株価データセットを格納する配列（[{時刻, 株価},...]）
var DataSets = [];
// グラフのY軸設定
var YAxes = [];
// 企業シンボルを格納する配列
var symbols = [];
// グラフを描画するチャートオブジェクト
var myChart;
// ダッシュボードに表示する企業一覧
var companytable;

function AddToDashboard(symbol) {
	
	var isFirstCommit = false;

	if(!companytable) {
		isFirstCommit = true;
		companytable = document.createElement('table');
		companytable.id = "company-table";
		companytable.setAttribute("class", "table table-condensed");
		companytable.setAttribute("class", "table table-borderless");
	}

	var row = companytable.insertRow(-1);
	var td1 = row.insertCell(-1);
	td1.setAttribute("class","col-xs-6");
	td1.appendChild(document.createTextNode(symbol));

	var td2 = row.insertCell(-1);
	td2.setAttribute("class","col-xs-3");
	// ボタンの生成
	var btn2 = document.createElement('button');
	btn2.type = 'button';
	btn2.className = 'btn btn-primary btn-sm';
	btn2.textContent = 'Detail';
	td2.appendChild(btn2);

	var td3 = row.insertCell(-1);
	td3.setAttribute("class","col-xs-3");
	// ボタンの生成
	var btn3 = document.createElement('button');
	btn3.type = 'button';
	btn3.className = 'btn btn-danger btn-sm';
	btn3.textContent = 'Delete';
	td3.appendChild(btn3);

	document.getElementById('company-list').appendChild(companytable);
}

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

// グラフの描画
function DrawChart(symbol, stock_price) {

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

	// キャンバスのコンテキストの取得
	var ctx = document.getElementById("myChart").getContext("2d");
	//ctx.canvas.height = 280;

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
				responsive : true,
				maintainAspectRatio : true,
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

// "Display stock price" ボタンを押したときに、株価グラフの描画
document.getElementById("form-button").onclick = function() {

	// フォームからシンボルを取得、配列に格納
	var symbol = document.getElementById("symbol").value
	symbols.push(symbol);

	// ダッシュボードの表示
	AddToDashboard(symbol);

	// 株価時系列データの取得
	stock_price = GetStockPrice(symbol);
	//console.log(stock_price);

	// グラフの描画
	DrawChart(symbol, stock_price);

}

function delete_chart() {
	symbols = [];

	DataSets = [];
	YAxes = [];

	companytable = null;

	myChart.clear();
	var cvs = document.getElementById("myChart");
	var ctx = document.getElementById("myChart").getContext("2d");
	ctx.clearRect(0, 0, cvs.width, cvs.height);

	var ctables = document.getElementById('company-table');
	//while(ctables.rows[0]) ctables.deleteRow(0);
	if(ctables) {
		document.getElementById('company-list').removeChild(ctables);
	}
	document.getElementById("symbol").value = "";
};

// リセットボタンを押したときに、データセット、グラフをクリアする
document.getElementById("reset-button").onclick = function() {
	delete_chart();
}