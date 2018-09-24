/*
 * sim.js: simulate the behavior of a system with:
 *
 * - a fixed number of clients, each making sequential requests
 * - a fixed number of servers, whose implementations are independent.
 *
 * Other assumptions:
 *
 * - Transit time for each request is 0.
 * - Client processing time for each request is 0.
 * - Each server is arbitrarily scalable.
 */

var mod_assertplus = require('assert-plus');
var mod_extsprintf = require('extsprintf');

var printf = mod_extsprintf.printf;

/*
 * Simulation parameters
 */

var nmilliseconds = 600000;	/* 2 minute simulation */
var nclients = 10000;		/* 10,000 clients */

/*
 * This object defines the servers that exist.
 *
 *    sc_count    count of servers like this one
 *
 *    sc_latency  latency (in milliseconds) of each response from this server
 */
var serverConfigs = [ {
    'sc_count': 1,		/* 1 slow server (1s responses) */
    'sc_latency': 1000,
}, {
    'sc_count': 99,		/* 99 fast servers (1ms responses) */
    'sc_latency': 1
} ];

/*
 * Simulation state
 */
var simState = {
    's_curtime': 0,	/* current time */
    's_clients': [],	/* list of client state objects */
    's_servers': []	/* list of server state objects */
};

function main()
{
	simInit(simState);

	while (simState.s_curtime < nmilliseconds) {
		simTick(simState);
	}

	simReport(simState);
}

/*
 * Initialize the simulation by creating client state objects for each of
 * "nclients" and server state objects as described in "serverConfigs".
 */
function simInit(ss)
{
	var i, j, k;
	var sc;

	/*
	 * Create a client state object for each client.
	 */
	for (i = 0; i < nclients; i++) {
		ss.s_clients.push({
		    'c_which': i,
		    'c_name': 'client_' + i,
		    'c_nextfree': 1,		/* next tick when the client */
		    'c_curserver': null		/* can make a request */
		});
	}

	/*
	 * Create a server state object for each server.
	 */
	for (i = 0, j = 0; i < serverConfigs.length; i++) {
		sc = serverConfigs[i];
		for (k = 0; k < sc.sc_count; j++, k++) {
			ss.s_servers.push({
			    's_name': 'server_' + j,
			    's_latency': sc.sc_latency,
			    's_ncompleted': 0
			});
		}
	}
}

/*
 * Execute one "tick" of the simulation, which represents one millisecond.
 */
function simTick(ss)
{
	var ci, c, si, s;

	ss.s_curtime++;

	/*
	 * Iterate the clients, recording any completed requests and issuing any
	 * new ones.
	 */
	for (ci = 0; ci < ss.s_clients.length; ci++) {
		c = ss.s_clients[ci];
		if (c.c_nextfree > ss.s_curtime) {
			/* The client is still busy with the current server. */
			mod_assertplus.ok(c.c_curserver !== null);
			continue;
		}

		mod_assertplus.ok(c.c_nextfree === ss.s_curtime);

		/*
		 * If "s_curserver" is non-null, then a request was outstanding
		 * that has now completed.  Record it.  This should always be
		 * true when we reach this point except on the first tick.
		 */
		if (c.c_curserver !== null) {
			si = c.c_curserver;
			s = ss.s_servers[si];
			s.s_ncompleted++;
		} else {
			mod_assertplus.equal(ss.s_curtime, 1);
		}

		/*
		 * Now choose the next server for a request for this client.
		 */
		si = Math.floor(ss.s_servers.length * Math.random());
		mod_assertplus.ok(si >= 0 && si < ss.s_servers.length);
		s = ss.s_servers[si];
		c.c_nextfree = ss.s_curtime + s.s_latency;
		c.c_curserver = si;
	}
}

function simReport(ss)
{
	var s, sum, rps;

	sum = 0;
	for (i = 0; i < ss.s_servers.length; i++) {
		s = ss.s_servers[i];
		sum += s.s_ncompleted;
		printf('%-9s %10d requests (%4d rps)\n',
		    s.s_name, s.s_ncompleted,
		    Math.round(1000 * s.s_ncompleted / nmilliseconds));
	}

	rps = 1000 * sum / nmilliseconds;
	printf('overall: %11d requests (%6d rps, expect %d rps per server)\n',
	    sum, rps, rps / ss.s_servers.length);
}

main();
