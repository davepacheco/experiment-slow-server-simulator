# Slow server simulator

This repo contains a very simple simulator for exploring the behavior of a slow
server in a simple distributed system.  For more information, see the
accompanying blog post.

The configuration of the system is currently hardcoded.  It consists of:

- a time limit (how long a period to simulate)
- a total level of client concurrency
- an array of server classes, each of which includes a count and
  latency-per-request for that server.

The hardcoded configuration runs a 10-minute simulation with 10,000 clients, 1
"slow" server that takes 1s per request, and 99 "fast" servers that take 1ms per
request.  Results (`server_0` is the "slow" server):

    $ node sim.js 
    simulated time:           600000 ms
    total client concurrency: 10000
    servers:
         1 server that completes requests with latency 1000 ms (starting with "server_0")
        99 servers that complete requests with latency 1 ms (starting with "server_1")
    
    server_0     5455039 requests (  9092 rps)
    server_1     5462256 requests (  9104 rps)
    server_2     5459316 requests (  9099 rps)
    server_3     5463211 requests (  9105 rps)
    ...
    server_96    5459207 requests (  9099 rps)
    server_97    5458421 requests (  9097 rps)
    server_98    5458234 requests (  9097 rps)
    server_99    5456471 requests (  9094 rps)
    overall:   545829375 requests (909715 rps, expect 9097 rps per server)

As a sanity check on the simulator, if we change the simulation time to 990ms,
`server_0` completes no requests (as expected), while other servers complete
many:

    $ node sim.js 
    simulated time:           990 ms
    total client concurrency: 10000
    servers:
         1 server that completes requests with latency 1000 ms (starting with "server_0")
        99 servers that complete requests with latency 1 ms (starting with "server_1")
    
    server_0           0 requests (     0 rps)
    server_1        9954 requests ( 10055 rps)
    server_2       10114 requests ( 10216 rps)
    ...
    server_97       9844 requests (  9943 rps)
    server_98      10072 requests ( 10174 rps)
    server_99      10031 requests ( 10132 rps)
    overall:      995406 requests (1005460 rps, expect 10054 rps per server)
