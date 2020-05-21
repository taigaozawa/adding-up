'use strict';

const fs = require('fs');
const readline = require('readline');

const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ input: rs, output: {} });

const prefectureDataMap = new Map(); // key: 都道府県 => value: 集計データのオブジェクト


rl.on('line', (lineString) => {
    const columns = lineString.split(','); // カンマで区切って配列にする
    const year = parseInt(columns[0]); // 配列の0番目の要素（年）を数値に変換
    const prefecture = columns[1];
    const popu = parseInt(columns[2]); // 配列の2番目の要素（人口）を数値に変換
    
    if (year !== 2010 && year !== 2015) return;

    let value = prefectureDataMap.get(prefecture);
    if (!value) {
        value = {
            popu10: 0,
            popu15: 0,
            change: null
        };
    }
    if (year === 2010) {
        value.popu10 = popu;
    }
    if (year === 2015) {
        value.popu15 = popu;
    }

    prefectureDataMap.set(prefecture, value);
}); 

rl.on('close', () => {
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
    
    /**
     * prefectureDataMap : { 都道府県 => {集計データのオブジェクト} }
     * Array.from(prefectureDataMap) : [ [都道府県, {集計データのオブジェクト}] ]
     * rankingArray :  [ [都道府県, {集計データのオブジェクト}] ]
     */
    const rankingArray = Array.from(prefectureDataMap).sort( (pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    } );

    const rankingStrings = rankingArray.map( ([key,value]) => {
        return (
            key + ': ' + value.popu10 + '->' + value.popu15 +
            '  変化率: ' + value.change
        )
    });
    
    console.log(rankingStrings);
});