'use strict';

var alphabet = 'abcdefghijklmnopqrstuvwxyz_';
module.exports.alphabet = alphabet;
module.exports.nextId = function(idParams)
{
	var res = '';

	for (var i = idParams.idLen-1; i >= 0; i--)
	{
		var x = Math.pow(alphabet.length, i);
		var n = Math.floor(idParams.lastId/x);
		res += alphabet[n%alphabet.length];
	}

	idParams.lastId++;
	if (idParams.lastId > Math.pow(alphabet.length, idParams.idLen)-1)
	{
		idParams.idLen++;
		idParams.lastId = 0;
	}

	return res;
};
