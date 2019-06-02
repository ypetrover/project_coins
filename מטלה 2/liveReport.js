let chart, urlCoins, index, timeUpdateChart, inUrl = '', dataPoints = [], dataCoins = [];

$('#live').click((event) => {
    if ($('#chartContainer').length > 0) return;
    $('#processing').show();

    arr = $('#root input:checked');

    if (!arr.length) {
        Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: 'You must choose at least one coin!',
        });
        $('#processing').hide();
        return
    } else {
        $(`.allCard`).hide();
        $('#root').append('<div id="chartContainer" style="height: 470px; width: 100%;"></div>')

        $.each(arr, function (i) {
            let color = ['#e237bd', '#0b7ef1', '#ffc107', '#00bcd4', '#795548'];
            // let color = "#" + ((1 << 24) * Math.random() | 0).toString(16);
            a = { type: "line", name: arr[i].id.slice(0, -2).toUpperCase(), color: color[i], showInLegend: true, dataPoints: [] };
            dataCoins.push(a);
        });

        chart = new CanvasJS.Chart("chartContainer", {
            title: {
                text: "Representative rates for your selected currencies"
            },
            axisY: {
                includeZero: false,
                title: "USD",
                lineColor: "#C24642",
                tickColor: "#C24642",
                labelFontColor: "#C24642",
                titleFontColor: "#C24642",
                suffix: "$"
            },
            axisY2: [{
                includeZero: false,
                title: "EUR",
                lineColor: "#7F6084",
                titleFontColor: "#7F6084",
                labelFontColor: "#7F6084"
            },
            {
                includeZero: false,
                title: "ILS",
                logarithmic: true,
                interval: 1,
                lineColor: "#86B402",
                titleFontColor: "#86B402",
                labelFontColor: "#86B402"
            }],
            axisX: [{
                title: "TIME",
                labelAngle: 45,
                lineColor: "#C24642",
                tickColor: "#C24642",
                labelFontColor: "#C24642",
                titleFontColor: "#C24642"
            },
            {
                title: "The information is updated every two seconds"
            }],
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                itemclick: toggleDataSeries
            },
            data: dataCoins
        });
        chart.render();
        updateChart();
    }

    function updateChart() {
        if (dataCoins.length === 1) {
            urlCoins = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${dataCoins[0].name.toUpperCase()}&tsyms=USD`;
        } else {
            inUrl = '';
            $.each(dataCoins, function (i) {
                inUrl += dataCoins[i].name.toUpperCase() + ",";
                urlCoins = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${inUrl}&tsyms=USD`
            });
        };
        if (!$('#chartContainer').length) return;
        $.getJSON(urlCoins, function (data) {
            if (data.Response === "Error") {
                alert(data.Message)
            } else {
                index = 0;
                $.each(data, function (key, value) {
                    dataCoins[index].dataPoints.push({
                        label: new Date().toLocaleTimeString(),
                        y: value.USD
                    });
                    index++;
                });
            }
        });

        chart.render();
        timeUpdateChart = setTimeout(function () { updateChart() }, 2000);

    };
    $('#processing').hide();

    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }
});