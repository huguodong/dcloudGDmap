var geolocation;
var walkingRender;
var mylng, mylat;
var map = new AMap.Map('map', {
	resizeEnable: true,
	zoom: 14,
	//				mapStyle: 'light',
	//				center: [120.559235, 30.541955]
});
map.plugin('AMap.Geolocation', function() {
	geolocation = new AMap.Geolocation({
		zoomToAccuracy: true, //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false

	});
	map.addControl(geolocation);
	geolocation.getCurrentPosition();
	AMap.event.addListener(geolocation, 'complete', onComplete); //返回定位信息
	AMap.event.addListener(geolocation, 'error', onError); //返回定位出错信息
});

//解析定位结果
function onComplete(data) {
	mylng = data.position.getLng();
	mylat = data.position.getLat();
	map.setZoomAndCenter(14, [mylng, mylat]);
	var marker = new AMap.Marker({
		map: map,
		icon: 'mapicon.png', //24px*24px
		position: [data.position.getLng(), data.position.getLat()]
	});
	marker.on('click', function() {
		var info = new AMap.InfoWindow({
			content: "我在这儿！",
			offset: new AMap.Pixel(0, -28)
		});
		info.open(map, marker.getPosition());		
	})
	marker.setMap(map);

	AMap.service(["AMap.PlaceSearch"], function() {
		var placeSearch = new AMap.PlaceSearch({ //构造地点查询类
			type: '餐饮服务',
			city: '桐乡'
		});
		var cpoint = [mylng, mylat]; //中心点坐标
		placeSearch.searchNearBy('', cpoint, 1000, function(status, result) {
			pl = result.poiList;
			for(i = 0; i < pl.count; i++) {
				var marker = new AMap.Marker({
					map: map,
					position: [result.poiList.pois[i].location.lng, result.poiList.pois[i].location.lat]
				});
				AMap.event.addListener(marker, 'click', function(e) {
					if(walkingRender != null) {
						walkingRender.clearOverlays();
					}
					lng = e.target.getPosition().lng;
					lat = e.target.getPosition().lat;
					AMap.service('AMap.Walking', function() { //回调函数
						//实例化Walking
						walking = new AMap.Walking(); //构造路线导航类
						//根据起终点坐标规划步行路线，您如果想修改结果展现效果，请参考页面：http://lbs.amap.com/fn/css-style/
						walking.search([mylng, mylat], [lng, lat], function(status, result) {
							if(status === 'complete') {
								walkingRender = new Lib.AMap.WalkingRender()
								walkingRender.autoRender({
									data: result,
									map: map,
								});
							}
						});
					});
				});
				marker.setMap(map);
			}
		});
	});
}
//解析定位错误信息
function onError(data) {
	alert("定位失败")
}