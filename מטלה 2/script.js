let allCoins, hundreds, imageSrc, src, thisCoin, liveCoins, rootHtml = '', searchArray = [];

$(function () {

    $.get('https://api.coingecko.com/api/v3/coins/list', function (AllCoins) {
        allCoins = AllCoins;
        hundreds = allCoins.slice(1000, 1500);
        hundreds.forEach((value) => { searchArray.push(value.symbol) });
    });

    $.get('https://min-api.cryptocompare.com/data/all/coinlist', function (data) {
        liveCoins = data;
    });

    $('#home').click(function () {

        $('#processing').show();

        $('#chartContainer').remove();
        clearTimeout(timeUpdateChart);
        if ($('.allCard').length) {
            dataCoins = [];
            $(`.allCard`).show();
            $('.dSec').fadeOut(500, () => { $('.dSec').prev().show(); $('.dSec').remove() })
            $('#processing').hide();
            return
        }

        $.each(hundreds, function (index, val) {
            rootHtml += `
                    <div class="allCard">
                        <div id="${val.id}" class="fadeIn card card-body dMain" style="width: 18rem;">
                            <input onChange="check(event)" id="${val.symbol}ch" type="checkbox" class="tgl tgl-flat">
                            <label class="tgl-btn" for="${val.symbol}ch"></label>
                            <h5 class="card-title">${val.symbol.toUpperCase()}</h5>
                            <p class="card-text">${val.name}</p>
                            <button name=${val.id} class="btn btn-primary" onclick="{event.target.disabled = true; setTimeout(function(){event.target.disabled = false}, 500);}" onmouseup="info(event)">More info.</button>
                        </div>
                    </div>
                    `
        })
        $('#root').append(rootHtml);
        $('#processing').hide();
        $('#searchInput').attr('disabled', false).focus();
    });
});

function info(event) {
    $('#processing').show();
    let IDCoin = event.target.parentElement.id;
    let sym = event.target.parentElement.children[0].id.slice(0, -2);
    let time = new Date;
    let flag;
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i) === IDCoin) {
            let lsCheck = JSON.parse(localStorage.getItem(IDCoin));
            if ((time.getTime() - lsCheck.time) < 120000) {
                $(event.target.parentElement).fadeOut(500, function () {
                    $(event.target.parentElement.parentElement).append(lsCheck.data);
                })
                flag = true;
                $('#processing').hide();
            }
            break
        }
    }
    if (!flag) {
        $.ajax({
            type: "GET",
            url: `https://api.coingecko.com/api/v3/coins/${IDCoin}`,
            success: function (response) {
                let moreInfo = `
                    <div class="fadeIn card card-body dSec">
                    <div class="pic">
                    <img src="${response.image.small}">
                    <span  class="backCoin">${sym}</span>
                    </div>
                    <div class="price">
                    <span class="curr">Current price:</span><br/>
                    ${response.market_data.current_price.ils} ₪<br/>
                    ${response.market_data.current_price.usd} $<br/>
                    ${response.market_data.current_price.eur} €
                    </div>
                    <div class="btnCenter">
                    <button class="btn btn-primary" onclick="back(event)">back</button>
                    </div>
                    </div> 
                    `
                let ls = JSON.stringify({ "time": time.getTime(), "data": moreInfo });
                localStorage.setItem(IDCoin, ls);
                $(event.target.parentElement).fadeOut(500, function () {
                    $(event.target.parentElement).removeClass("fadeIn");
                    $(event.target.parentElement.parentElement).append(moreInfo);
                    $('#processing').hide();
                })
            }
        })
    };
    $(event.target).attr("disabled", false);
}

function back(event) {
    $('#processing').show();
    $(event.target.parentElement.parentElement).fadeOut(500, function () {

        $(event.target.parentElement.parentElement.parentElement.firstElementChild).addClass('fadeIn').show();
        $(event.target.parentElement.parentElement).remove();
        $('#processing').hide();
    });
}

let arr, lastChoice;
function check(event) {
    if (dataCoins.length > 1) {
        let t = event.target.id.slice(0, -2);
        for (let i = 0; i < dataCoins.length; i++) {
            debugger
            if (dataCoins[i].name.toLowerCase() === t) {
                dataCoins.splice(i, 1);
            }
        };
        $('#search').click();
    } else if (dataCoins.length === 1) {
        $('#clearAllSelected').click();
    }
    let ch;
    let itWithCh = event.target.id.toUpperCase();
    let itIs = itWithCh.slice(0, -2);
    if (!liveCoins.Data[itIs] || !liveCoins.Data[itIs].IsTrading) {
        event.target.checked = false;
        Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: 'There is not live report for this coin. sorry!',
        });
    } else {
        $.getJSON(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${itIs}&tsyms=USD`, function (data) {
            ch = data.Response
            if (ch === 'Error') {
                event.target.checked = false;
                Swal.fire({
                    type: 'error',
                    title: 'Oops...',
                    text: 'There is not live report for this coin. sorry!',
                });
            } else {
                arr = $('#root input:checked');
                if (arr.length > 5) {
                    lastChoice = event.target;
                    lastChoice.checked = false;
                    arr = $('#root input:checked');
                    modal();
                } else {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });

                    Toast.fire({
                        type: 'success',
                        title: 'Action successful'
                    });
                }
            }
        });
    }
}

function modal() {
    let html = '';
    arr.each(function () {
        html += `<li><input onchange="upd()" class="tgl tgl-flat" id="${this.id}" type="checkbox" checked="true"> <label class="tgl-btn" for="${this.id}"></label><span class="backCoin">${this.id.slice(0, -2)}</span></li>`
    });
    $('#ul').append(html);
    $('#msgModal').append(`<b>Select up to five coins!</b><br/>To add the <span id="theNew">"${lastChoice.id.slice(0, -2).toUpperCase()}"</span> currency, you must remove a currency from the list.`)
    $('#modal').show();
}

function upd() {
    $('#modal input:checked').length < 5 ? $('#theNew').css("color", "#7fc6a6") : $('#theNew').css("color", "red");
    !$(event.target)[0].checked ? $($(event.target).parent().children()[2]).css("color", "rgba(127, 198, 166, 0.37)") : $($(event.target).parent().children()[2]).css("color", "#7fc6a6");
}

function cls() {
    let s = $('li>input');
    s.each((i) => {
        $('#root input#' + s[i].id)[0].checked = s[i].checked;
    });
    arr = $('li>input:checked');
    arr.length === 5 ? lastChoice.checked = false : lastChoice.checked = true;
    $('#msgModal').html('');
    $('#ul').html('');
    $('#modal').hide();
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });

    Toast.fire({
        type: 'success',
        title: 'Action successful'
    });
    $('#ul').html('');
}

function cancel() {
    $('#msgModal').html('');
    $('#ul').html('');
    $('#modal').hide();
}

function smartSearch() {
    let serco = $('#searchInput').val().toLowerCase();
    if (!serco) {
        $(`.allCard`).show();
        return;
    }
    if (!$(`input[id^="${serco}"]`).length) {
        Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: 'There is no currency with this name!',
        })
        return;
    }
    $(`.allCard`).hide();
    $(`input[id^="${serco}"]`).parent().parent().show();
}
autocomplete(document.getElementById("searchInput"), searchArray);

function showSelected() {
    arr = $('#root input:checked');
    if (!arr.length) {
        Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: 'No coins selected!',
        })
        $('#search').blur();
        return
    }
    $(`.allCard`).hide();
    $('#root input:checked').parent().parent().show();
    $('#searchInput').val('').focus();
}

function clearSelected() {
    $('#chartContainer').remove();
    // clearTimeout(timeUpdateChart);
    dataCoins = [];

    $('#root input:checked').prop('checked', false);
    $(`.allCard`).show();
    $('.dSec').fadeOut(500, () => { $('.dSec').prev().show(); $('.dSec').remove() })
    $('#searchInput').val('').focus();
}

$('#about').click(function () {
    Swal.fire({
        title: '<strong class="rTl">קצת על הפרויקט</strong>',
        type: 'info',
        html:
            '<b>שמי ידידיה פטרובר</b>, ' +
            'וזכיתי ללמוד קורס פול סטאק אצל המורה דניאל חזן!<br/>' +
            'מקוה שהתוצאות לא מביישות את שמו הטוב.',
        showCloseButton: true,
    })
})