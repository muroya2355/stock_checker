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
// 企業詳細を格納する配列
var companydetail = {};


// "Display stock price" ボタンを押したときに、株価の取得、グラフの描画など
document.getElementById("form-button").onclick = function() {

	// フォームからシンボルを取得、配列に格納
	var symbol = document.getElementById("symbol").value
	symbols.push(symbol);

	// 選択企業をダッシュボードに追加
	AddToDashboard(symbol);

	// 株価時系列データの取得
	stock_price = GetStockPrice(symbol);

	// グラフの描画
	DrawChart(symbol, stock_price);

}

// リセットボタンを押したときに、データセット・グラフをクリアする
document.getElementById("reset-button").onclick = function() {
	ResetAll();
}

// 選択企業をダッシュボードに追加
function AddToDashboard(symbol) {

	
	if(!companytable) {
		// テーブルの生成
		companytable = document.createElement('table');
		companytable.id = "company-table";
		companytable.setAttribute("class", "table table-condensed");
		companytable.setAttribute("class", "table table-borderless");
	}

	// 新規行の追加
	var row = companytable.insertRow(-1);

	// １列目：企業名
	var td1 = row.insertCell(-1);
	td1.setAttribute("class","col-xs-6");
	td1.appendChild(document.createTextNode(symbol));

	// ２列目：詳細表示ボタン
	var td2 = row.insertCell(-1);
	td2.setAttribute("class","col-xs-3");
	// 詳細表示ボタンの生成
	var detailbutton = cleate_detailbutton(symbol);
	td2.appendChild(detailbutton);

	// ３列目：削除ボタン
	var td3 = row.insertCell(-1);
	td3.setAttribute("class","col-xs-3");
	// 削除ボタンの生成
	var deletebutton = cleate_deletebutton(symbol);
	td3.appendChild(deletebutton);

	// 生成したテーブルをダッシュボードに登録
	document.getElementById('company-list').appendChild(companytable);
}

function DeleteFromDashboard(symbol) {

	var idx=0;
	for(i=0; i<companytable.rows.length; i++) {
		if(companytable.rows[i].cells[0].firstChild.data.toLowerCase()==symbol.toLowerCase())
			idx = i;
	}
	companytable.deleteRow(idx);
	
	// テーブルをダッシュボードに登録
	document.getElementById('company-list').appendChild(companytable);
};

function GetDetails(symbol) {

	var companydetail = {};

	var xmlHttpRequest = new XMLHttpRequest();
		if (xmlHttpRequest) {
			xmlHttpRequest.onreadystatechange = function(){
				// 正常なレスポンスが返ってきた場合
				if( this.readyState == 4 && this.status == 200 ){
					if( this.response ){
						try{
							// レスポンスをcompanylist に代入
							companydetail = JSON.parse(this.response);
							//console.log(companydetail);
						} catch (e) {
							console.log(e);
						}
		}}}}

		// IEX API に対してGETリクエストを送信
		xmlHttpRequest.open( 'GET', 'https://api.iextrading.com/1.0/stock/'+symbol.toLowerCase()+'/company', false);
		// GETリクエストなのでbody部に何も送らない
		xmlHttpRequest.send( null );

		return companydetail;

}

function ShowDetail(companydetail) {
	// 要素を取得
	var targetElement = document.getElementById("dialog") ;

	var detailtable = document.getElementById("detail-table");
	if(detailtable){
		detailtable.remove();
	}

	// 詳細テーブルの作成
	detailtable = document.createElement('table');
	detailtable.setAttribute("class", "table table-condensed");
	detailtable.setAttribute("class", "table table-borderless");
	detailtable.id = "detail-table";

	for (key in companydetail) {
		// 新規行の追加
		var row = detailtable.insertRow(-1);
		// １列目：キー
		var td1 = row.insertCell(-1);
		td1.appendChild(document.createTextNode(key));
		// ２列目：値
		var td2 = row.insertCell(-1);
		td2.appendChild(document.createTextNode(companydetail[key]));
	}

	// 生成したテーブルをダイアログに登録
	document.getElementById("dialog").appendChild(detailtable);

	// 開く
	targetElement.showModal();
}

// 詳細表示ボタンの生成
function cleate_detailbutton(symbol) {
	var btn2 = document.createElement('button');
	btn2.type = 'button';
	btn2.className = 'btn btn-primary btn-sm';
	btn2.textContent = 'Detail';
	btn2.onclick = function() {
		var companydetail = GetDetails(symbol);
		ShowDetail(companydetail);
	};
	return btn2;
}

// 削除ボタンの生成
function cleate_deletebutton(symbol) {
	var btn3 = document.createElement('button');
	btn3.type = 'button';
	btn3.className = 'btn btn-danger btn-sm';
	btn3.textContent = 'Delete';
	btn3.onclick = function() {
		DeleteFromDashboard(symbol);
		DeleteFromChart(symbol);
	};
	return btn3;
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

	clear_canvas();

	cleate_canvas();

	add_data(symbol, stock_price);

	var ctx = canvas.getContext("2d");

	create_chart(ctx);

}

function DeleteFromChart(symbol) {
	clear_canvas();

	delete_data(symbol);
	
	cleate_canvas();

	var ctx = canvas.getContext("2d");

	create_chart(ctx);
}

// データセット・グラフをクリア
function ResetAll() {
	clear_canvas();
	clear_all_data();
}

function add_data(symbol, stock_price) {

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
}

function delete_data(symbol) {
	var idx = 0;
	for (i=0; i<DataSets.length; i++) {
		if(DataSets[i].label.toLowerCase()==symbol.toLowerCase())
			idx = i;
	}
	DataSets.splice(idx,1);
	YAxes.splice(idx,1);
}

function clear_all_data() {
	symbols = [];

	DataSets = [];
	YAxes = [];

	companytable = null;

	var ctables = document.getElementById('company-table');
	if(ctables) {
		document.getElementById('company-list').removeChild(ctables);
	}
	document.getElementById("symbol").value = "";
}

function cleate_canvas(){
	var canvas = document.createElement('canvas');
	canvas.id = "canvas";
	document.getElementById('myChart_canvas').appendChild(canvas);
}

function clear_canvas() {

	var canvas = document.getElementById("canvas");
	if(canvas) {
		document.getElementById('myChart_canvas').removeChild(canvas);
		canvas.remove();
	}
	if(myChart) {
		myChart.destroy();
	}
}

function create_chart(ctx) {

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
