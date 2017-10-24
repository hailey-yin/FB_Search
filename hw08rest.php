<?php

require_once __DIR__ . '/php-graph-sdk-5.0.0/src/Facebook/autoload.php';

if(isset($_GET['id'])){
    $url = "/".$_GET['id']."?fields=id,name,picture.width(700).height(700),albums.limit(5){name,photos.limit(2){name,picture}},posts.limit(5)&access_token=EAAVKzosa82MBADOXGg6ZCboNZBuVshiJOCxpDTSb2GZC0q8wrX9V2Gfu9YwEHyX5JwRZAvScGySyLglS9ZC3LAgaLSwy0ZCyWglroZBhuNNLGP07laTeTriZAFQcdhC6YatuF7FaYSPXWnSzZArCTKZAXQbvk0kgLdOjQZD";
    showResult($url);
} else if(isset($_GET['pageurl'])) {
    $url = $_GET['pageurl'];
    $content = file_get_contents($url);
    echo $content;
} else {
    if(isset($_GET['type'])&&$_GET['type']=='place'&&isset($_GET['lat'])&&isset($_GET['lng'])) {
        $lat = $_GET['lat'];
        $lng = $_GET['lng'];
        $url = '/search?q='.urlencode($_GET['keyword']).'&type=place&center='.$lat.','.$lng.'&distance='.$_GET['distance'].'&fields=id,name,picture.width(700).height(700)&access_token=EAAVKzosa82MBADOXGg6ZCboNZBuVshiJOCxpDTSb2GZC0q8wrX9V2Gfu9YwEHyX5JwRZAvScGySyLglS9ZC3LAgaLSwy0ZCyWglroZBhuNNLGP07laTeTriZAFQcdhC6YatuF7FaYSPXWnSzZArCTKZAXQbvk0kgLdOjQZD';
        showResult($url);
    } else if(isset($_GET['type'])&&$_GET['type']=='event'){
        $url = '/search?q='.urlencode($_GET['keyword']).'&type='.$_GET['type'].'&fields=id,name,picture.width(700).height(700),place&access_token=EAAVKzosa82MBADOXGg6ZCboNZBuVshiJOCxpDTSb2GZC0q8wrX9V2Gfu9YwEHyX5JwRZAvScGySyLglS9ZC3LAgaLSwy0ZCyWglroZBhuNNLGP07laTeTriZAFQcdhC6YatuF7FaYSPXWnSzZArCTKZAXQbvk0kgLdOjQZD';
        showResult($url);
    } else if(isset($_GET['type'])){
        $url = '/search?q='.urlencode($_GET['keyword']).'&type='.$_GET['type'].'&fields=id,name,picture.width(700).height(700)&access_token=EAAVKzosa82MBADOXGg6ZCboNZBuVshiJOCxpDTSb2GZC0q8wrX9V2Gfu9YwEHyX5JwRZAvScGySyLglS9ZC3LAgaLSwy0ZCyWglroZBhuNNLGP07laTeTriZAFQcdhC6YatuF7FaYSPXWnSzZArCTKZAXQbvk0kgLdOjQZD';
        showResult($url);
    }
}

function showResult($url){
    if(isset($url)){
        $result = getData($url);
        echo json_encode($result);
    }
}

function getData($url){
    $fb = new Facebook\Facebook([
        'app_id' => '1489625841070947',
        'app_secret' => "adf620a3fdae1b7093156d15ba22644d",
        'default_graph_version' => 'v2.8',
        'default_access_token' => "EAAVKzosa82MBADOXGg6ZCboNZBuVshiJOCxpDTSb2GZC0q8wrX9V2Gfu9YwEHyX5JwRZAvScGySyLglS9ZC3LAgaLSwy0ZCyWglroZBhuNNLGP07laTeTriZAFQcdhC6YatuF7FaYSPXWnSzZArCTKZAXQbvk0kgLdOjQZD"
    ]);
    try {
        $response = $fb->get($url);
    } catch(Facebook\Exceptions\FacebookResponseException $e) {
        echo 'Graph returned an error: '.$e->getMessage();
        exit;
    } catch(Facebook\Exceptions\FacebookSDKException $e) {
        echo 'Facebook SDK returned an error: '.$e->getMessage();
        exit;
    }
    return $response->getDecodedBody();
}
?>


