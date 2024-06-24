import type { DocumentNode } from 'graphql'

type AnyObject = Record<string, unknown>

const MAX_LENGTH_QUERY_VARS_TIMELINE = 60

/**
 * Generate name to display on the request timeline (for analysis on non-production environment).
 */
export function getQueryTimelineName<QueryVariables>(options: {
  query: DocumentNode
  variables: QueryVariables
  excludedVars?: string[]
}): string {
  const { query, variables, excludedVars = [] as string[] } = options

  const queryVars = {} as AnyObject
  for (const varKey in variables) {
    if (!excludedVars.includes(varKey)) queryVars[varKey] = variables[varKey]
  }

  return query.definitions
    ?.map(def => {
      if ('operation' in def && 'name' in def) {
        let name = def.operation === 'query' ? (def.name || {}).value || '' : ''
        if (Object.keys(queryVars).length) name += ` ${stringifyQueryVariables(queryVars)}`
        return name
      }
    })
    .filter(v => v)
    .join(',')
}

function stringifyQueryVariables(variables: AnyObject) {
  const strVars = JSON.stringify(variables)
  return strVars.length > MAX_LENGTH_QUERY_VARS_TIMELINE
    ? `${strVars.substring(0, MAX_LENGTH_QUERY_VARS_TIMELINE)}...}`
    : strVars
}
