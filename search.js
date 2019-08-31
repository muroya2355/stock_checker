// 企業一覧オブジェクト一覧を格納する配列
allcompanylist = [];

// IEX API から企業一覧を取得、companylist に格納する関数
function GetAllCompanies() {

	var xmlHttpRequest = new XMLHttpRequest();
		if (xmlHttpRequest) {
			xmlHttpRequest.onreadystatechange = function(){
				// 正常なレスポンスが返ってきた場合
				if( this.readyState == 4 && this.status == 200 ){
					if( this.response ){
						// レスポンスをcompanylist に代入
						allcompanylist = this.response;
						//console.log(companylist);

		}}}}

		// IEX API に対してGETリクエストを送信
		xmlHttpRequest.open( 'GET', 'https://cloud.iexapis.com/stable/ref-data/symbols?token=pk_9c97781015d04a6c9db41ff2843c16ab');
		// JSON形式でパース
		xmlHttpRequest.responseType = 'json';
		// GETリクエストなのでbody部に何も送らない
		xmlHttpRequest.send( null );

}

// 関数の実行、企業一覧の読み込み
GetAllCompanies();

// キーワードからリアルタイムで企業を検索
$(function () {
	SearchWord = function() {
		// 検索結果の企業オブジェクトを格納する配列
		var searchResult,
		// formに入力されたテキスト（検索キーワード）
		searchText = $(this).val(),
		// 検索結果件数
		hitNum;

		// 検索結果を空にする
		searchResult = [];

		// 検索結果表示エリアをいったん空にする
		$('#search-result__list').empty();
		$('.search-result__hit-num').empty();

		// 検索キーワードが3文字以上の場合、検索開始
		if (searchText.length >= 3) {
			
			// 企業一覧から、シンボルと企業名で絞込み
			searchResult = allcompanylist.filter(function(item, index){
				if (item.isEnabled==true && 
						((item.name).toLowerCase().indexOf(searchText.toLowerCase())>=0 ||
						(item.symbol).toLowerCase().indexOf(searchText.toLowerCase())>=0 ))
						return true;
			});
			//console.log(company);
			
			// 検索結果の表示。各検索結果に対して
			for (var i = 0; i < searchResult.length; i ++) {
				// ボタンの生成
				var btn = document.createElement('button');
				btn.type = 'button';
				btn.id = 'search_result_'+searchResult[i].symbol;
				btn.className = 'btn btn-link btn-sm';
				btn.textContent = searchResult[i].symbol+" ("+searchResult[i].name+")";
				// ボタンクリック時に、検索フォームに企業シンボルを代入
				btn.onclick = new Function('document.getElementById("symbol").value = "' + searchResult[i].symbol + '";');
				// 結果表示エリアにボタンを登録
				document.getElementById('search-result__list').appendChild(btn);
			}

			// 検索結果件数の表示
			hitNum = searchResult.length;
			$('.search-result__hit-num').append(hitNum + ' results are found');
			
		}
	};

	// 検索フォームのテキストに対して、キーワード検索を実施
	$('#symbol').on('input', SearchWord);
})

// 検索結果のクリア
function clear_searchresult() {
	document.getElementById("symbol").value = "";

	// 検索結果表示エリアを空にする
	$('#search-result__list').empty();
	$('.search-result__hit-num').empty();
}