// 株価の取得
function GetStockPrice(symbol, period) {

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
							// {時刻, 株価} の組を配列に格納
							var time, price;
							if(period=='1d') {
								// 株価が正常な値の時に
								if (list[i].average > 10) {
									time = moment(list[i].date+" "+list[i].minute, "YYYYMMDD hh:mm");
									price = list[i].average;
								}
							} else {
								time = moment(list[i].date, "YYYY-MM-DD");
								price = list[i].close;
							}
							if(time && price)
								stock_price.push({t : time, y : price});
						}
					} catch (e) {
						console.log(e);
					}
	}}}}

	// API にアクセスし*非同期で*データを取得（非推奨）
	xmlHttpRequest.open( 'GET', 'https://api.iextrading.com/1.0/stock/'+symbol.toLowerCase()+'/chart/'+period, false );
	xmlHttpRequest.send( null );

	// 配列を返す
	return stock_price;
}

// 最新の株価を取得
function GetLatestPrice(symbol) {

	var price = null;

	// リクエストの生成
	var xmlHttpRequest = new XMLHttpRequest();
	if (xmlHttpRequest) {
		xmlHttpRequest.onreadystatechange = function(){
			// 正常なレスポンスが返ってきたときに
			if( this.readyState == 4 && this.status == 200 ){
				if( this.response ){
					price = this.response;

	}}}}

	// API にアクセスし*非同期で*データを取得（非推奨）
	xmlHttpRequest.open( 'GET', 'https://api.iextrading.com/1.0/stock/'+symbol.toLowerCase()+'/price', false );
	xmlHttpRequest.send( null );

	// 配列を返す
	return price;

}