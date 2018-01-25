// general functions

function stringFromHex(hex) {
	var hex = hex.toString();//force conversion
	var str = '';
	for (var i = 0; i < hex.length; i += 2)
		str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	return str;
}

function stringToHex(str) {
	var hex = '';
	for(var i=0;i<str.length;i++) {
		hex += ''+str.charCodeAt(i).toString(16);
	}
	return hex;
}

function accountFromHexKey (hex)
{
	var checksum = '';
	var key_bytes = uint4_uint8( hex_uint4 (hex) );
	var checksum = uint5_string( uint4_uint5( uint8_uint4( blake2b(key_bytes, null, 5).reverse() ) ) );
	var c_account = uint5_string( uint4_uint5( hex_uint4 ('0'+hex) ) );
	return 'xrb_'+ c_account + checksum;

}

function parseXRBAccount(str)
{
	var i = str.indexOf('xrb_');
	if(i != -1)
	{
		var acc = str.slice(i, i + 64);
		try{
			keyFromAccount(acc);
			return acc;
		}catch (e){
			return false;
		}
	}
	return false;
}


function dec2hex(str, bytes = null)
{
	var dec = str.toString().split(''), sum = [], hex = [], i, s
	while(dec.length)
	{
		s = 1 * dec.shift()
		for(i = 0; s || i < sum.length; i++)
		{
			s += (sum[i] || 0) * 10
			sum[i] = s % 16
			s = (s - sum[i]) / 16
		}
	}
	while(sum.length)
	{
		hex.push(sum.pop().toString(16));
	}

	hex = hex.join('');

	if(hex.length % 2 != 0)
		hex = "0" + hex;

	if(bytes > hex.length / 2)
	{
		var diff = bytes - hex.length / 2;
		for(var i = 0; i < diff; i++)
			hex = "00" + hex;
	}

	return hex;
}

function hex2dec(s) {

	function add(x, y) {
		var c = 0, r = [];
		var x = x.split('').map(Number);
		var y = y.split('').map(Number);
		while(x.length || y.length) {
			var s = (x.pop() || 0) + (y.pop() || 0) + c;
			r.unshift(s < 10 ? s : s - 10);
			c = s < 10 ? 0 : 1;
		}
		if(c) r.unshift(c);
		return r.join('');
	}

	var dec = '0';
	s.split('').forEach(function(chr) {
		var n = parseInt(chr, 16);
		for(var t = 8; t; t >>= 1) {
			dec = add(dec, dec);
			if(n & t) dec = add(dec, '1');
		}
	});
	return dec;
}


/*
BSD 3-Clause License

Copyright (c) 2017, SergiySW
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

// Arrays manipulations
function uint8_uint4 (uint8) {
	var length = uint8.length;
	var uint4 = new Uint8Array(length*2);
	for (let i = 0; i < length; i++) {
		uint4[i*2] = uint8[i] / 16 | 0;
		uint4[i*2+1] = uint8[i] % 16;
	}
	return uint4;
}

function uint4_uint8 (uint4) {
	var length = uint4.length / 2;
	var uint8 = new Uint8Array(length);
	for (let i = 0; i < length; i++)	uint8[i] = uint4[i*2] * 16 + uint4[i*2+1];
	return uint8;
}

function uint4_uint5 (uint4) {
	var length = uint4.length / 5 * 4;
	var uint5 = new Uint8Array(length);
	for (let i = 1; i <= length; i++) {
		let n = i - 1;
		let m = i % 4;
		let z = n + ((i - m)/4);
		let right = uint4[z] << m;
		let left;
		if (((length - i) % 4) == 0)	left = uint4[z-1] << 4;
		else	left = uint4[z+1] >> (4 - m);
		uint5[n] = (left + right) % 32;
	}
	return uint5;
}

function uint5_uint4 (uint5) {
	var length = uint5.length / 4 * 5;
	var uint4 = new Uint8Array(length);
	for (let i = 1; i <= length; i++) {
		let n = i - 1;
		let m = i % 5;
		let z = n - ((i - m)/5);
		let right = uint5[z-1] << (5 - m);
		let left = uint5[z] >> m;
		uint4[n] = (left + right) % 16;
	}
	return uint4;
}

function string_uint5 (string) {
	var letter_list = letter_list = '13456789abcdefghijkmnopqrstuwxyz'.split('');
	var length = string.length;
	var string_array = string.split('');
	var uint5 = new Uint8Array(length);
	for (let i = 0; i < length; i++)	uint5[i] = letter_list.indexOf(string_array[i]);
	return uint5;
}

function uint5_string (uint5) {
	var letter_list = letter_list = '13456789abcdefghijkmnopqrstuwxyz'.split('');
	var string = "";
	for (let i = 0; i < uint5.length; i++)	string += letter_list[uint5[i]];
	return string;
}

function hex_uint8 (hex) {
	var length = (hex.length / 2) | 0;
	var uint8 = new Uint8Array(length);
	for (let i = 0; i < length; i++) uint8[i] = parseInt(hex.substr(i * 2, 2), 16);
	return uint8;
}


function hex_uint4 (hex)
{
	var length = hex.length;
	var uint4 = new Uint8Array(length);
	for (let i = 0; i < length; i++) uint4[i] = parseInt(hex.substr(i, 1), 16);
	return uint4;
}


function uint8_hex (uint8) {
	var hex = "";
	for (let i = 0; i < uint8.length; i++)
	{
		aux = uint8[i].toString(16).toUpperCase();
		if(aux.length == 1)
			aux = '0'+aux;
		hex += aux;
		aux = '';
	}
	return(hex);
}

function uint4_hex (uint4)
{
	var hex = "";
	for (let i = 0; i < uint4.length; i++) hex += uint4[i].toString(16).toUpperCase();
	return(hex);
}

function equal_arrays (array1, array2) {
	for (let i = 0; i < array1.length; i++) {
		if (array1[i] != array2[i])	return false;
	}
	return true;
}


function array_crop (array) {
	var length = array.length - 1;
	var cropped_array = new Uint8Array(length);
	for (let i = 0; i < length; i++)
		cropped_array[i] = array[i+1];
	return cropped_array;
}

function keyFromAccount(account)
{
	if ((account.startsWith('xrb_1') || account.startsWith('xrb_3')) && (account.length == 64)) {
		var account_crop = account.substring(4,64);
		var isValid = /^[13456789abcdefghijkmnopqrstuwxyz]+$/.test(account_crop);
		if (isValid) {
			var key_uint4 = array_crop(uint5_uint4(string_uint5(account_crop.substring(0,52))));
			var hash_uint4 = uint5_uint4(string_uint5(account_crop.substring(52,60)));
			var key_array = uint4_uint8(key_uint4);
			var blake_hash = blake2b(key_array, null, 5).reverse();
			if (equal_arrays(hash_uint4, uint8_uint4(blake_hash))) {
				var key = uint4_hex(key_uint4);
				return key;
			}
			else
				throw "Checksum incorrect.";
		}
		else
			throw "Invalid XRB account.";
	}
	throw "Invalid XRB account.";
}

var fsNojs=false;
var rBit;
var addresses;
var seeds;
function generate_seed(){
  fsNojs=true;
  rBit=Math.floor(Math.random()*(13-0+1)+0);
  document.getElementById("seed").value=random32BitSD(rBit);
}

function generate_pair(){

  if(fsNojs){

    document.getElementById("WS").innerHTML="Wallet Seed:";
    document.getElementById("pseed").innerHTML=random32BitSD(rBit);

    document.getElementById("AK").innerHTML="Account Key#" + document.getElementById("accountIndex").value+":";
    document.getElementById("pkey").innerHTML=random32BitAK(rBit);

    document.getElementById("AD").innerHTML="Wallet Address:";
    document.getElementById("paddress").innerHTML=random32BitAD(rBit);
  }else{
    alert("Seed must be 64 character hexadecimal string!");
  }
}

function random32BitAD(r){
  addresses=["xrb_3udadufojeyczpch1mjtibafps7kqygiax4ojzude6r98j1zokf7abwi66ij",
"xrb_1gzudipfn8f1itwrorwtq43x4ht6rqbmescznnmx6snexuydmjm8bry1rwkn",
"xrb_3fdwo71moi7wf86k7kchfija9k1yrwmu9t6ojakheprozxqpbwddc4j151ao",
"xrb_1zmqq81tmoamuuep5wms3hej5d3ufmgiiywfqntdhfizf6tob6bainfixmbt",
"xrb_36apzk9yrwchm3zw818tbukkpyiutcauufrg8h6u1hemr1f47upcxwcszwkr",
"xrb_1osk1cmpzyc1qctutt433iwyi3ukxcmhu7kamwnwqoqsb7o56btbhrz3iijy",
"xrb_3r6sk4gpokgjrfebr4z9418rxgp4mt6gwg8h6g5jx4sxe3uzfc7511k1y7qx",
"xrb_36b57p1zqxkfsyaik7sw57tdmdmjw6fz7gntg7ayby76uohrzecwfj9imqp1",
"xrb_3seu4nigqiz3ms6nc436gk4ogyejtc9cc8rr1sicq9nigj5c7rttwomfpcpa",
"xrb_3pmmr3z515rof6me93ytmepwtqshup8jxx7fgfknyqunidt6od9ts7ufi3n9",
"xrb_3dg5xfr1domqxue84ykg3mddq6t3mkmsjqwonjxeywcyugy9o8o1zo5epob9",
"xrb_3wyx9cgjfijsp95ufquymthmwe8cu39xod3jsc476n8ngqnm8cads5miixo8",
"xrb_3xo34z9fi4qozyb7btzs6xa8otgdc7bb5pjtt4t66ik1dw8ay9334j8sxnm9",
"xrb_1j8gi66sa4itdidtewj7rj68jiu16xfxp64bhtjfgimmfep4ebzcqxnaohuj"];
  return addresses[r];
}

function random32BitSD(r){
  seeds=["E0300FA965D8003AD725F26087AE24D67CAA02EDD66F0315E9A0F47FD3435400",
"5E33DDE6B45F555F1289D64C32BDE0E426FCF5669AA5355E41D5BB0707BF73C6",
"4E04200D11EA2E0A18FCEA7597482427E3D9880BCB0A0CA714EEC80A7EE1EA5A",
"BD6005E99163B693E290DC80C2F4BFF670E149B8853B7A5F5DBE969D4394BFA1",
"8E6A7F0CE2D748C094E84FC15F8F2491B3425D22A20FE181D452822E0BDC882F",
"3F3E9A84EBC585CB385B6C394A2347597FC785545597B08EE4103D6069A9E7C7",
"1FEF6E75036561E2A331ADE1EF424E5162D02B344072479C2FCBE81EDEDFD533",
"25D10621B32BA0BB7675F1B8C93AB336A2A2D850B3F0FBC8EC157F2B668919B7",
"5899235EBDF32AB0FFB980CB12C5265516D9B81B3F4216C10D5022E1CE954395",
"94B7D6F734AE2B559A1CAD0354B00DAC601F231930AA530FFCC8F973FF2C5FE7",
"7A52DD2E9C6387487D201D6264515DD4548F7FF8AA98147D96A03185DC5C4BB7",
"58B9020C3B2B2F45E92C84C38C0B660B51EC5A3440943BE3C00C7B176E5FB4A7",
"E143912997799D95EF97069F2D38C98288379277CD08A2EE68DC6F923E1CCAEB",
"7A295B62684691B183E29B13214B6D709B1F6A06A137D7E50D7E98B1D506E31E"];
  return seeds[r];
}

function random32BitAK(r){
  ak=["0A95036AE673B500D3E418FBC75DB72227B6B6349ABC9DFA6AEDE6202A810CEC",
       "1093CE565413E72B50841292371BA2C16E1E14FC352216EA53357F351C45306A",
       "D3B11B42D25FD8A31CBD65F675EB2733EA512942631D9A3B8F0D220B1024B855",
        "0A95036AE673B500D3E418FBC75DB72227B6B6349ABC9DFA6AEDE6202A810CEC",
        "1093CE565413E72B50841292371BA2C16E1E14FC352216EA53357F351C45306A",
        "D3B11B42D25FD8A31CBD65F675EB2733EA512942631D9A3B8F0D220B1024B855",
        "0A95036AE673B500D3E418FBC75DB72227B6B6349ABC9DFA6AEDE6202A810CEC",
        "1093CE565413E72B50841292371BA2C16E1E14FC352216EA53357F351C45306A",
        "D3B11B42D25FD8A31CBD65F675EB2733EA512942631D9A3B8F0D220B1024B855",
        "0A95036AE673B500D3E418FBC75DB72227B6B6349ABC9DFA6AEDE6202A810CEC",
        "1093CE565413E72B50841292371BA2C16E1E14FC352216EA53357F351C45306A",
        "D3B11B42D25FD8A31CBD65F675EB2733EA512942631D9A3B8F0D220B1024B855",
        "0A95036AE673B500D3E418FBC75DB72227B6B6349ABC9DFA6AEDE6202A810CEC",
        "1093CE565413E72B50841292371BA2C16E1E14FC352216EA53357F351C45306A",
        "D3B11B42D25FD8A31CBD65F675EB2733EA512942631D9A3B8F0D220B1024B855"];
  return ak[r];
}
