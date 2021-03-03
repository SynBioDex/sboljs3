
import SBOL2GraphView from '../../SBOL2GraphView'
import SBOL3GraphView from '../../SBOL3GraphView'

import S2ComponentDefinition from '../../sbol2/S2ComponentDefinition'
import S3Component from '../../sbol3/S3Component'
import S3Range from '../../sbol3/S3Range'
import S3OrientedLocation from '../../sbol3/S3OrientedLocation'
import S3ThingWithLocation from '../../sbol3/S3ThingWithLocation'
import S2ModuleDefinition from '../../sbol2/S2ModuleDefinition'
import S2FunctionalComponent from '../../sbol2/S2FunctionalComponent'
import S2SequenceAnnotation from '../../sbol2/S2SequenceAnnotation'
import S2GenericLocation from '../../sbol2/S2GenericLocation'
import S2Experiment from '../../sbol2/S2Experiment'
import S2ExperimentalData from '../../sbol2/S2ExperimentalData'
import S3Experiment from '../../sbol3/S3Experiment'
import S3ExperimentalData from '../../sbol3/S3ExperimentalData'
import S2Range from '../../sbol2/S2Range'
import S3Identified from '../../sbol3/S3Identified'
import S2Identified from '../../sbol2/S2Identified'
import { Graph } from 'rdfoo'

import { Types, Predicates, Prefixes, Specifiers } from 'bioterms'

import S2IdentifiedFactory from '../../sbol2/S2IdentifiedFactory'
import URIUtils from '../../URIUtils';
import S2Sequence from '../../sbol2/S2Sequence';
import { S2Attachment, S2Implementation, S2Cut, S2Collection, S2ModuleInstance, S2ComponentInstance } from '../..'
import S3Cut from '../../sbol3/S3Cut'
import S3Facade from '../../sbol3/S3Facade'
import S2Facade from '../../sbol2/S2Facade'
import { assert } from 'console'

export default function convert3to2(graph:Graph) {

    let newGraph = new Graph()
    let sbol3View:SBOL3GraphView = new SBOL3GraphView(graph)

    let sbol2View:SBOL2GraphView = new SBOL2GraphView(newGraph)


    let dontPrune = new Set<string>()


    for(let ed of sbol3View.experimentalData) {
        let ed2 = new S2ExperimentalData(sbol2View, ed.uri)
        ed2.setUriProperty(Predicates.a, Types.SBOL2.ExperimentalData)
        copyIdentifiedProperties(ed, ed2)
    }

    for(let ex of sbol3View.experiments) {
        let ex2 = new S2Experiment(sbol2View, ex.uri)
        ex2.setUriProperty(Predicates.a, Types.SBOL2.Experiment)
        copyIdentifiedProperties(ex, ex2)
        for(let ed of ex.experimentalData) {
            ex2.insertUriProperty(Predicates.SBOL3.experimentalData, ed.uri)
        }
    }

    for(let seq of sbol3View.sequences) {
        let seq2 = new S2Sequence(sbol2View, seq.uri)
        seq2.setUriProperty(Predicates.a, Types.SBOL2.Sequence)
        copyIdentifiedProperties(seq, seq2)
        seq2.elements = seq.elements
        seq2.encoding = seq.encoding
    }

    for(let att of sbol3View.attachments) {
        let att2 = new S2Attachment(sbol2View, att.uri)
        att2.setUriProperty(Predicates.a, Types.SBOL2.Attachment)
        copyIdentifiedProperties(att, att2)
        att2.source = att.source
        att2.format = att.format
        att2.hash = att.hash
        att2.size = att.size
    }



    type Mapping = {
        cd: S2ComponentDefinition,
        md: S2ModuleDefinition,
        fc: S2FunctionalComponent,
        cdSuffix:string,
        mdSuffix:string
    }
    
    let componentToCDandMD:Map<string, Mapping> = new Map()
    let subcomponentToFC:Map<string, S2FunctionalComponent> = new Map()

    function getCDandMD(componentURI:string):Mapping|undefined {
        let mapping = componentToCDandMD.get(componentURI)
        if(!mapping) {
            console.warn(componentURI + ' has no cd/md mapping?')
        }
        return mapping
    }

    // Create CDs and MDs for every component, where the MD contains the CD as an FC
    //
    for(let component of sbol3View.components) {

        let cdUri = component.uri
        let mdUri = component.uri

        let cdSuffix = '_component'
        let mdSuffix = '_module'

        // both URIs need to be different, but want to try to keep the old SBOL2 URI for the correct object if we can
        //
        switch(component.getUriProperty('http://sboltools.org/backport#sbol2type')) {
            case Types.SBOL2.ModuleDefinition:
                mdSuffix = ''
                break
            case Types.SBOL2.ComponentDefinition:
            default:
                cdSuffix = ''
                break
        }

        if(cdSuffix !== '')
            cdUri = URIUtils.addSuffix(cdUri, cdSuffix)

        if(mdSuffix !== '')
            mdUri = URIUtils.addSuffix(mdUri, mdSuffix)

        switch(component.getUriProperty('http://sboltools.org/backport#sbol2type')) {
            case Types.SBOL2.ModuleDefinition:
                dontPrune.add(mdUri)
                break
            case Types.SBOL2.ComponentDefinition:
                dontPrune.add(cdUri)
                break
        }

        let cd = new S2ComponentDefinition(sbol2View, cdUri)
        cd.setUriProperty(Predicates.a, Types.SBOL2.ComponentDefinition)
        copyIdentifiedProperties(component, cd)
        cd.displayId = displayId(component) + cdSuffix


        let md = new S2ModuleDefinition(sbol2View, mdUri)
        md.setUriProperty(Predicates.a, Types.SBOL2.ModuleDefinition)
        copyIdentifiedProperties(component, md)
        md.displayId = displayId(component) + mdSuffix

        // md.setUriProperty('http://sboltools.org/backport#sbol3component', component.uri)
        // cd.setUriProperty('http://sboltools.org/backport#sbol3component', component.uri)


        if(md.persistentIdentity && mdSuffix)
            md.persistentIdentity = URIUtils.addSuffix(md.persistentIdentity, mdSuffix)

        if(cd.persistentIdentity && cdSuffix)
            cd.persistentIdentity = URIUtils.addSuffix(cd.persistentIdentity, cdSuffix)

        let fcUri = md.persistentIdentity + '/' + displayId(component)

        let fc = new S2FunctionalComponent(sbol2View, fcUri)
        fc.insertUriProperty(Predicates.a, Types.SBOL2.FunctionalComponent)
        fc.setStringProperty(Predicates.SBOL2.displayId, displayId(component))
        md.addFunctionalComponent(fc)

        for(let role of component.roles) {
            cd.addRole(role)
        }

        for(let type of component.types) {
            cd.addType(type)
        }

        for(let seq of component.sequences) {
            cd.insertUriProperty(Predicates.SBOL2.sequence, seq.uri)
        }

        for(let feature of component.sequenceFeatures) {

            let sa = new S2SequenceAnnotation(sbol2View, feature.uri)
            sa.setUriProperty(Predicates.a, Types.SBOL2.SequenceAnnotation)
            copyIdentifiedProperties(feature, sa)

            cd.insertUriProperty(Predicates.SBOL2.sequenceAnnotation, sa.uri)

            for(let role of feature.roles) {
                sa.addRole(role)
            }

            copyLocations(sbol2View, feature, sa)
        }

        componentToCDandMD.set(component.uri, { cd, md, fc, mdSuffix, cdSuffix })
    }

    // Make subcomponents into ALL of:
        // - SBOL2 subcomponents
        // - SBOL2 functionalcomponents
        // - SBOL2 submodules

    for(let component of sbol3View.components) {

        let mapping = getCDandMD(component.uri)

        if(!mapping) {
            throw new Error('???')
        }

        let { cd, md, fc } = mapping

        for(let subcomponent of component.subComponents) {

            let defUri = subcomponent.getRequiredUriProperty(Predicates.SBOL3.instanceOf)
            
            let newDefOfSubcomponent = getCDandMD(defUri)

            if(newDefOfSubcomponent === undefined) {
                throw new Error('???')
            }


            var cdSubcomponentURI, mdSubcomponentURI, mdSubmoduleURI

            switch (subcomponent.getUriProperty('http://sboltools.org/backport#sbol2type')) {
                case Types.SBOL2.Module:
                    mdSubmoduleURI = subcomponent.uri
                    cdSubcomponentURI = URIUtils.addSuffix(subcomponent.uri, '_c')
                    mdSubcomponentURI = URIUtils.addSuffix(subcomponent.uri, '_fc')
                    break
                case Types.SBOL2.FunctionalComponent:
                    mdSubcomponentURI = subcomponent.uri
                    cdSubcomponentURI = URIUtils.addSuffix(subcomponent.uri, '_c')
                    mdSubmoduleURI = URIUtils.addSuffix(subcomponent.uri, '_m')
                    break
                case Types.SBOL2.Component:
                default:
                    cdSubcomponentURI = subcomponent.uri
                    mdSubcomponentURI = URIUtils.addSuffix(subcomponent.uri, '_fc')
                    mdSubmoduleURI = URIUtils.addSuffix(subcomponent.uri, '_m')
                    break
            }



            let cdSubcomponent = new S2ComponentInstance(sbol2View, cdSubcomponentURI)
            cdSubcomponent.setUriProperty(Predicates.a, Types.SBOL2.Component)
            cdSubcomponent.definition = newDefOfSubcomponent.cd

            cd.insertUriProperty(Predicates.SBOL2.component, cdSubcomponent.uri)


            let mdSubcomponent = new S2FunctionalComponent(sbol2View, mdSubcomponentURI)
            mdSubcomponent.setUriProperty(Predicates.a, Types.SBOL2.FunctionalComponent)
            mdSubcomponent.definition = newDefOfSubcomponent.cd

            md.insertUriProperty(Predicates.SBOL2.functionalComponent, mdSubcomponent.uri)



            let mdSubmodule = new S2ModuleInstance(sbol2View, mdSubmoduleURI)
            mdSubmodule.setUriProperty(Predicates.a, Types.SBOL2.Module)
            mdSubmodule.definition = newDefOfSubcomponent.md

            md.insertUriProperty(Predicates.SBOL2.module, mdSubmodule.uri)
            


            switch (subcomponent.getUriProperty('http://sboltools.org/backport#sbol2type')) {
                case Types.SBOL2.Module:
                    copyIdentifiedProperties(subcomponent, mdSubmodule)
                    break
                case Types.SBOL2.FunctionalComponent:
                    copyIdentifiedProperties(subcomponent, mdSubcomponent)
                    break
                case Types.SBOL2.Component:
                    copyIdentifiedProperties(subcomponent, cdSubcomponent)
                    break
                default:
                    copyIdentifiedProperties(subcomponent, mdSubcomponent)
                    copyIdentifiedProperties(subcomponent, cdSubcomponent)
                    break

            }

            subcomponentToFC.set(subcomponent.uri, mdSubcomponent)

            if(subcomponent.measure)
                mdSubcomponent.setUriProperty(Predicates.SBOL2.measure, subcomponent.measure.uri)


            if(subcomponent.sourceLocation) {
                cdSubcomponent.setUriProperty(Predicates.SBOL3.sourceLocation, subcomponent.sourceLocation.uri)
            }

            if(subcomponent.locations.length > 0) {

                // if it has locations it needs a SA

                let saDisplayId = subcomponent.getStringProperty('http://sboltools.org/backport#sequenceAnnotationDisplayId')

                if(!saDisplayId) {
                    saDisplayId = displayId(subcomponent) + '_anno'
                }

                let saIdent = S2IdentifiedFactory.createChild(sbol2View, Types.SBOL2.SequenceAnnotation, cd, Predicates.SBOL2.sequenceAnnotation, saDisplayId, subcomponent.getStringProperty(Predicates.SBOL2.version))
                let sa = new S2SequenceAnnotation(sbol2View, saIdent.uri)
                sa.setUriProperty(Predicates.SBOL2.component, subcomponent.uri)

                copyLocations(sbol2View, subcomponent, sa)


            }
        }
    }

    // Port interactions
    for(let component of sbol3View.components) {

        let mapping = getCDandMD(component.uri)

        if(!mapping) {
            throw new Error('???')
        }

        let { cd, md, fc, cdSuffix, mdSuffix } = mapping

        for(let interaction of component.interactions) {

            let newInteraction = md.createInteraction(displayId(interaction), interaction.getStringProperty(Predicates.SBOL2.version))
            copyIdentifiedProperties(interaction, newInteraction)

            if (interaction.measure) {
                newInteraction.setUriProperty(Predicates.SBOL2.measure, interaction.measure.uri)
            }

            for(let type of interaction.types) {
                newInteraction.insertUriProperty(Predicates.SBOL2.type, type)
            }

            for(let participation of interaction.participations) {

                let newParticipation = newInteraction.createParticipation(displayId(participation), participation.getStringProperty(Predicates.SBOL2.version))
                copyIdentifiedProperties(participation, newParticipation)

                if (participation.measure) {
                    newParticipation.setUriProperty(Predicates.SBOL2.measure, participation.measure.uri)
                }

                for(let role of participation.roles) {
                    newParticipation.addRole(role)
                }

                let participant = participation.participant

                if(participant) {

                    let newParticipant = subcomponentToFC.get(participant.uri)

                    newParticipation.participant = newParticipant

                }
            }
        }
    }


    for(let impl of sbol3View.implementations) {
        const impl2:S2Implementation = new S2Implementation(sbol2View, impl.uri)
        impl2.setUriProperty(Predicates.a, Types.SBOL2.Implementation)
        copyIdentifiedProperties(impl, impl2)

        impl2.setUriProperty(Predicates.SBOL2.built, impl.getUriProperty(Predicates.SBOL3.built))
    }


    for(let coll of sbol3View.collections) {
        let coll2:S2Collection = new S2Collection(sbol2View, coll.uri)
        coll2.setUriProperty(Predicates.a, Types.SBOL2.Collection)
        copyIdentifiedProperties(coll, coll2)

        for(let member of coll.members) {
            coll2.insertUriProperty(Predicates.SBOL2.member, member.uri)


            // if it's a component that has been mapped to an SBOL2 CD and MD,
            // add both to the SBOL2 collection.
            //
            let cdAndMdMapping = componentToCDandMD.get(member.uri)

            if(cdAndMdMapping) {
                coll2.insertUriProperty(Predicates.SBOL2.member, cdAndMdMapping.cd.uri)
                coll2.insertUriProperty(Predicates.SBOL2.member, cdAndMdMapping.md.uri)
            }
        }

    }


    // We can do some pruning now.
    //
    //  1) ModuleDefinitions with no interactions and no models are "pointless modules".
    //     They can be deleted along with their submodules and FCs.
    // 
    //  2) Similarly, ComponentDefinitions with no sequences, sequence annotations, or subcomponents
    //     are "pointless components"
    //
    // Important not to delete both though! Or we would completely lose the object when in SBOL2
    // land, including its non SBOL properties if any.
    //
    // It's easier to do this on the generated SBOL2 because it means we don't
    // have to make assumptions about how the SBOL3 will map to SBOL2.
    //

    for(let mapping of componentToCDandMD) {

        let componentUri = mapping[0]
        let { md, cd, fc, cdSuffix, mdSuffix } = mapping[1]

        let mdPruned = false, cdPruned = false

        if(!dontPrune.has(md.uri)) {
            if (md.interactions.length === 0 && md.models.length === 0 && md.measures.length === 0) {
                md.destroy()
                mdPruned = true
            }
        }

        if(!mdPruned && !dontPrune.has(cd.uri)) {
            if(cd.containedObjects.length === 0) {
                cd.destroy()
                cdPruned = true
            }
        }

        if(mdPruned && !cdPruned) {

            // remove suffix from component

            if(cdSuffix.length > 0) {

                assert(cd.uri.endsWith(cdSuffix))
                assert(cd.displayId!.endsWith(cdSuffix))

                let newDisplayid = cd.displayId!.substr(0, cd.displayId!.length - cdSuffix.length)
                cd.displayId = newDisplayid

                let newUri = cd.uri.substr(0, cd.uri.length - cdSuffix.length)

                newGraph.replaceURI(cd.uri, newUri)
            }

        } else if(cdPruned && !mdPruned) {

            // remove suffix from module

            if(mdSuffix.length > 0) {

                assert(md.uri.endsWith(mdSuffix))
                assert(md.displayId!.endsWith(mdSuffix))

                let newDisplayid = md.displayId!.substr(0, md.displayId!.length - mdSuffix.length)
                md.displayId = newDisplayid

                let newUri = md.uri.substr(0, md.uri.length - mdSuffix.length)

                newGraph.replaceURI(md.uri, newUri)
            }
        }
       

    }


    // Delete anything with an SBOL3 type from the graph

    for(let typeTriple of graph.match(null, Predicates.a, null)) {
        if(typeTriple.object.toString().indexOf(Prefixes.sbol3) === 0) {
            graph.removeMatches(typeTriple.subject, null, null)
        }
    }



    // For "generic top levels"

    graph.replaceURI(Predicates.SBOL3.persistentIdentity, Predicates.SBOL2.persistentIdentity)
    graph.replaceURI(Predicates.SBOL3.displayId, Predicates.SBOL2.displayId)
    graph.replaceURI('http://sboltools.org/backport#sbol2version', Predicates.SBOL2.version)


    graph.addAll(newGraph)

    function copyIdentifiedProperties(a:S3Identified, b:S2Identified) {

        let aTriples = graph.match(a.uri, null, null)


        for(let triple of aTriples) {
            
            let p = triple.predicate.nominalValue

            if(p === Predicates.a) {
                continue
            }

            if(p === Predicates.SBOL3.displayId) {
                b.graph.insert(b.uri, Predicates.SBOL2.displayId, triple.object)
                continue
            }

            if(p === Predicates.SBOL3.persistentIdentity) {
                b.graph.insert(b.uri, Predicates.SBOL2.persistentIdentity, triple.object)
                continue
            }

            if(p === Predicates.SBOL3.name) {
                b.graph.insert(b.uri, Predicates.Dcterms.title, triple.object)
                continue
            }

            if(p === Predicates.SBOL3.description) {
                b.graph.insert(b.uri, Predicates.Dcterms.description, triple.object)
                continue
            }

            if(p === Predicates.SBOL3.hasMeasure) {
                b.graph.insert(b.uri, Predicates.SBOL2.measure, triple.object)
                continue
            }

            if(p === 'http://sboltools.org/backport#sbol2version') {
                b.graph.insert(b.uri, Predicates.SBOL2.version, triple.object)
                continue
            }


            if(p.indexOf('http://sboltools.org/backport') !== -1) {
                continue
            }

            if(p.indexOf(Prefixes.sbol3) !== 0) {
                b.graph.insert(b.uri, triple.predicate.nominalValue, triple.object)
            }
        }
    }


    function copyLocations(sbol2View:SBOL2GraphView, oldThing:S3ThingWithLocation, newThing:S2SequenceAnnotation) {

        for(let location of oldThing.locations) {
            if(location instanceof S3Range) {

                let newLoc = new S2Range(sbol2View, location.uri)
                newLoc.insertUriProperty(Predicates.a, Types.SBOL2.Range)
                copyIdentifiedProperties(location, newLoc)

                newThing.insertUriProperty(Predicates.SBOL2.location, newLoc.uri)

                if(location.sequence) {
                    newLoc.setUriProperty(Predicates.SBOL2.sequence, location.sequence.uri)
                }

                newLoc.start = location.start
                newLoc.end = location.end

                copyOrientation(location, newLoc)

            } else if(location instanceof S3Cut) {

                let newLoc = new S2Cut(sbol2View, location.uri)
                newLoc.insertUriProperty(Predicates.a, Types.SBOL2.Cut)
                copyIdentifiedProperties(location, newLoc)

                newThing.insertUriProperty(Predicates.SBOL2.location, newLoc.uri)

                if(location.sequence) {
                    newLoc.setUriProperty(Predicates.SBOL2.sequence, location.sequence.uri)
                }

                newLoc.at = location.at

                newLoc.orientation = location.orientation === Specifiers.SBOL3.Orientation.ReverseComplement ?
                        Specifiers.SBOL2.Orientation.ReverseComplement : Specifiers.SBOL2.Orientation.Inline

                copyOrientation(location, newLoc)

            } else if(location instanceof S3OrientedLocation) {

                let newLoc = new S2GenericLocation(sbol2View, location.uri)
                newLoc.insertUriProperty(Predicates.a, Types.SBOL2.GenericLocation)
                copyIdentifiedProperties(location, newLoc)

                newThing.insertUriProperty(Predicates.SBOL2.location, newLoc.uri)

                if(location.sequence) {
                    newLoc.setUriProperty(Predicates.SBOL2.sequence, location.sequence.uri)
                }

                copyOrientation(location, newLoc)

            } else {
                throw new Error('not implemented location type')
            }

            function copyOrientation(a: S3Facade, b: S2Facade) {

                let o = a.getUriProperty(Predicates.SBOL3.orientation)

                if (o !== undefined) {

                    let o2 = o

                    if (o2 === Specifiers.SBOL3.Orientation.Inline)
                        o2 = Specifiers.SBOL2.Orientation.Inline
                    else if (o2 === Specifiers.SBOL3.Orientation.ReverseComplement)
                        o2 = Specifiers.SBOL2.Orientation.ReverseComplement

                    b.setUriProperty(Predicates.SBOL2.orientation, o2)
                }
            }
        }
    }


}



function displayId(obj:S3Identified) {

    let displayId = obj.displayId

    if(displayId)
        return displayId

    let slash = obj.uri.split('/').pop() || ''
    let hash = obj.uri.split('#').pop() || ''

    return slash.length > hash.length ? slash : hash
}

