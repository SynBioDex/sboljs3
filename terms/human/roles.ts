
import { Specifiers } from '../Specifiers'

const roles = [
    {
        name: 'CDS',
        uri: Specifiers.SBOL2.Role.CDS,
    },
    {
        name: 'Engineered Region',
        uri: Specifiers.SBOL2.Role.EngineeredRegion
    },
    {
        name: 'OriR',
        uri: Specifiers.SBOL2.Role.OriginOfReplication
    },
    {
        name: 'OriT',
        uri: Specifiers.SBOL2.Role.OriginOfTransfer
    },
    {
        name: 'Plasmid Backbone',
        uri: Specifiers.SBOL2.Role.PlasmidBackbone
    },
    {
        name: 'Promoter',
        uri: Specifiers.SBOL2.Role.Promoter
    },
    {
        name: 'RBS',
        uri: Specifiers.SBOL2.Role.RBS
    },
    {
        name: 'Restriction Site',
        uri: Specifiers.SBOL2.Role.RestrictionSite
    },
    {
        name: 'Terminator',
        uri: Specifiers.SBOL2.Role.Terminator
    }
]

const uriToName:Map<string, string> = new Map<string, string>()

roles.forEach((role) => {
    uriToName.set(role.uri, role.name)
})

export function roleURIToName(uri:string):string {

    return uriToName.get(uri) || uri

}

export default roles







