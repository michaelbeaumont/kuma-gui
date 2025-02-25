import { rest, RestRequest, ResponseComposition, RestContext, RestHandler, setupWorker } from 'msw'
import { setupServer } from 'msw/node'

const MOCK_FILES_ROOT_PATH: string = './mock/responses'

const requireMockFile = (filename: string) => require(`${MOCK_FILES_ROOT_PATH}/${filename}`)

const mockFilenameBasePaths: string[] = [
  // all of matches which contain "+" in url could be matched only by
  // RegEx as some of other examples below.
  'config',
  'versions',
  'meshes',
  'mesh-insights',
  'mesh-insights/default',
  'mesh-insights/hello-world',
  'mesh-insights/kong-mania-12',
  'dataplanes', // comment to have onboarding without data planes active
  'health-checks',
  'proxytemplates',
  'traffic-logs',
  'traffic-traces',
  'traffic-permissions',
  'traffic-routes',
  'fault-injections',
  'service-insights',
  'external-services',
  'retries',
  'circuit-breakers',
  'zones',
  'status/zones',

  'meshes/default',
  'meshes/mesh-01',
  'meshes/kong-mania-12',
  'meshes/hello-world',

  'meshes/default/service-insights',

  'meshes/default/external-services',
  'meshes/default/external-services/httpbin',
  'meshes/default/external-services/httpbin2',

  'meshes/default/dataplanes',
  'meshes/default/dataplanes/test-dp-02',
  'meshes/default/dataplanes/ingress-dp-test-123',
  'meshes/default/dataplanes+insights/ingress-dp-test-123',
  'meshes/default/dataplanes/gateway-dp-87qntx',
  'meshes/default/dataplanes/dataplane-test-456',

  'gateways',
  'meshes/default/gateways',
  'meshes/default/gateways/edge-gateway',

  'gateway-routes',
  'meshes/default/gateway-routes',
  'meshes/default/gateway-routes/edge-gateway',

  'meshes/default/traffic-traces',
  'meshes/default/traffic-traces/tt-1',
  'meshes/default/traffic-traces/traffic-trace-02',

  'meshes/default/health-checks',
  'meshes/default/health-checks/web-to-backend',
  'meshes/default/health-checks/web-to-banana',
  'meshes/default/health-checks/hello-health-check',
  'meshes/default/health-checks/testing-health-checks',
  'meshes/default/health-checks/health-check-0023',
  'meshes/default/health-checks/health-check-12345',
  'meshes/default/health-checks/foo-bar-baz-123',

  'meshes/default/fault-injections',
  'meshes/default/fault-injections/web-to-backend.kuma-system',
  'meshes/default/fault-injections/fi1.kuma-system',

  'meshes/default/traffic-routes',

  'meshes/default/timeouts',

  'meshes/default/retries',

  'meshes/default/proxytemplates',
  'meshes/helloworld/proxytemplates',
  'meshes/default/proxytemplates/pt-1',
  'meshes/helloworld/proxytemplates/pt-123',

  'meshes/default/traffic-logs',
  'meshes/default/traffic-logs/tl-1',
  'meshes/default/traffic-logs/tl-123',

  'meshes/default/traffic-permissions',
  'meshes/default/traffic-permissions/tp-1',
  'meshes/default/traffic-permissions/tp-1234',
  'meshes/default/traffic-permissions/tp-alpha-tango-donut',

  'meshes/default/circuit-breakers',
  'meshes/default/circuit-breakers/cb1',
  'meshes/default/circuit-breakers/cb2',
  'meshes/alpha-tango-mesh/circuit-breakers',

  'zones+insights',
  'zones+insights/zone-1',
  'zones+insights/zone-2',
  'zones+insights/zone-3',
  'zones+insights/cluster-1',
  'meshes/default/dataplanes+insights/cluster-1.backend-02',
  'meshes/default/dataplanes+insights/cluster-1.backend-03',
  'meshes/default/dataplanes+insights/cluster-1.ingress-02',
  'meshes/default/dataplanes+insights/cluster-1.gateway-01',
  'meshes/default/dataplanes+insights/backend',
  'meshes/default/dataplanes+insights/frontend',
  'meshes/default/dataplanes+insights/db',
  'meshes/default/dataplanes+insights/no-subscriptions',

  'global-insights',
]

const regexMatcher = (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
  const pathname = req.url.pathname.substring(1)

  return res(ctx.json(requireMockFile(`${pathname}.json`)))
}

const setupHandlers = (apiURL: string): RestHandler[] => {
  const handlers = mockFilenameBasePaths.map((path: string) =>
    rest.get(`${apiURL}${path}`, (req, res, ctx) => res(ctx.json(requireMockFile(`${path}.json`)))),
  )

  handlers.push(
    rest.get(apiURL, (req, res, ctx) =>
      res(
        ctx.json({
          hostname: 'Tomaszs-MacBook-Pro-16-inch-2019',
          tagline: 'Kuma',
          version: '1.3.0',
          instanceId: 'Tomaszs-MacBook-Pro-16-inch-2019-c2a8',
          clusterId: 'ea1c9d9d-9722-4fda-8051-67e6fe0ad1b4',
        }),
      ),
    ),
  )

  handlers.push(rest.get(/zones\+insights/, regexMatcher))
  handlers.push(rest.get(/zoneegressoverviews/, regexMatcher))
  handlers.push(rest.get(/zoneingresses\+insights/, regexMatcher))
  handlers.push(rest.get(/meshes\/default\/dataplanes\+insights/, regexMatcher))

  handlers.push(
    rest.get(/dataplanes\+insights/, (req, res, ctx) => {
      const gateway = req.url.searchParams.get('gateway')

      if (gateway === 'false') {
        // standard
        return res(ctx.json(requireMockFile('dataplanes+insights__only_standard.json')))
      }

      if (gateway === 'true') {
        // gateway
        return res(ctx.json(requireMockFile('dataplanes+insights__only-gateways.json')))
      }

      if (!gateway) {
        // all
        return res(ctx.json(requireMockFile('dataplanes+insights.json')))
      }
    }),
  )

  handlers.push(
    rest.get(`${apiURL}meshes/:mesh/:policyType/:policyName/dataplanes`, (req, res, ctx) =>
      res(ctx.json(requireMockFile('policy-connections.json'))),
    ),
  )

  handlers.push(
    rest.get(`${apiURL}meshes/:mesh/dataplanes/:dataplaneName/policies`, (req, res, ctx) =>
      res(ctx.json(requireMockFile('dataplane-policies.json'))),
    ),
  )

  handlers.push(
    rest.get(`${apiURL}meshes/:mesh/dataplanes/:dataplaneName/xds`, (req, res, ctx) =>
      res(ctx.json(requireMockFile('dataplane-xds.json'))),
    ),
  )

  handlers.push(
    rest.get(`${apiURL}zoneingresses/:zoneIngressName/xds`, (req, res, ctx) =>
      res(ctx.json(requireMockFile('dataplane-xds.json'))),
    ),
  )

  handlers.push(
    rest.get(`${apiURL}zoneegresses/:zoneEgressName/xds`, (req, res, ctx) =>
      res(ctx.json(requireMockFile('dataplane-xds.json'))),
    ),
  )

  return handlers
}

const worker = (apiURL: string) => setupWorker(...setupHandlers(apiURL))

const additionalTestHandlers: RestHandler[] = [
  rest.get('https://kuma.io/latest_version/', (req, res, ctx) => res(ctx.status(200), ctx.text('1.2.2'))),
]

const server = (apiURL: string) => setupServer(...setupHandlers(apiURL), ...additionalTestHandlers)

export { worker, server }
