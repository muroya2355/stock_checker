// ダッシュボードに表示する企業一覧表
var _companytable;

// 選択企業をダッシュボードに追加
function AddToDashboard(symbol, price) {

	
	if(!_companytable) {
		// テーブルの生成
		_companytable = document.createElement('table');
		_companytable.id = "company-table";
		_companytable.setAttribute("class", "table table-mb-0 table-sm");
	}

	// 新規行の追加
	var row = _companytable.insertRow(-1);

	// １列目：企業名
	var td1 = row.insertCell(-1);
	td1.setAttribute("class","col-xs-4");
	td1.appendChild(document.createTextNode(symbol));

	// ２列目：最新の株価
	var td2 = row.insertCell(-1);
	td2.setAttribute("class","col-xs-4");
	td2.appendChild(document.createTextNode('$'+price));

	// ３列目：詳細表示ボタン
	var td3 = row.insertCell(-1);
	td3.setAttribute("class","col-xs-2");
	// 詳細表示ボタンの生成
	var detailbutton = cleate_detailbutton(symbol);
	td3.appendChild(detailbutton);

	// ４列目：削除ボタン
	var td4 = row.insertCell(-1);
	td4.setAttribute("class","col-xs-2");
	// 削除ボタンの生成
	var deletebutton = cleate_deletebutton(symbol);
	td4.appendChild(deletebutton);

	// 生成したテーブルをダッシュボードに登録
	document.getElementById('company-list').appendChild(_companytable);
}

// ダッシュボードから選択企業を削除する
function DeleteFromDashboard(symbol) {

	// 選択企業のインデックスを検索
	var idx=0;
	for(i=0; i<_companytable.rows.length; i++) {
		if(_companytable.rows[i].cells[0].firstChild.data.toLowerCase()==symbol.toLowerCase())
			idx = i;
	}
	_companytable.deleteRow(idx);
	
	// テーブルをダッシュボードに登録
	document.getElementById('company-list').appendChild(_companytable);
};

// 企業情報の取得
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

// 企業情報の表示
function ShowDetail(companydetail) {
	// 要素を取得
	var targetElement = document.getElementById("dialog") ;

	var detailtable = document.getElementById("detail-table");
	if(detailtable){
		detailtable.remove();
	}

	// 詳細テーブルの作成
	detailtable = document.createElement('table');
	detailtable.setAttribute("class", "table mb-0");
	detailtable.id = "detail-table";

	for (key in companydetail) {
		// 新規行の追加
		var row = detailtable.insertRow(-1);
		// １列目：キー
		var td1 = row.insertCell(-1);
		td1.innerHTML = '<strong>'+key+'</strong>';
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
	// ボタンがクリックされたとき、
	btn2.onclick = function() {
		// 企業情報の取得
		var companydetail = GetDetails(symbol);
		// 企業情報、登録ボタンの表示
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
	// ボタンがクリックされたとき、
	btn3.onclick = function() {
		// ダッシュボードから当該企業を削除
		DeleteFromDashboard(symbol);
		// グラフから当該企業を削除
		DeleteFromChart(symbol);
	};
	return btn3;
}

// ダッシュボードのクリア
function clear_dashboard() {
	var ctables = document.getElementById('company-table');
	if(ctables) {
		document.getElementById('company-list').removeChild(ctables);
	}
}