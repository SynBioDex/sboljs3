
import S3Identified from './S3Identified'

export default class S3Feature extends S3Identified {

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOL3.role)
    }

    hasRole(role:string):boolean {
        return this.view.graph.hasMatch(this.subject, Predicates.SBOL3.role, node.createUriNode(role))
    }

    addRole(role:string):void {
        this.insertProperty(Predicates.SBOL3.role, node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.view.graph.removeMatches(this.subject, Predicates.SBOL3.role, node.createUriNode(role))
    }

    get soTerms():string[] {

        let terms:string[] = []

        for(let role of this.roles) {
            let term = extractTerm(node.createUriNode(role))

            if(term)
                terms.push(term)
        }

        return terms
    }

    get containingObject():S3Identified|undefined {

        const subject = this.view.graph.matchOne(null, Predicates.SBOL3.hasFeature, this.subject)?.subject

        if(!subject) {
            throw new Error('has no containing object?')
        }

        return this.view.uriToIdentified(subject)

    }

    get containingComponent():S3Component {

        return this.containingObject as S3Component

    }

    get locations():Array<S3Location> {

        return this.getProperties(Predicates.SBOL3.hasLocation)
                   .map((subject:Node) => this.view.subjectToFacade(subject) as S3Location)
    }

    get rangeLocations():Array<S3Range> {

        return this.locations.filter((location:S3Identified) => {
            return location.objectType === Types.SBOL3.Range
        }).map((identified:S3Identified) => {
            return new S3Range(this.view, identified.subject)
        })

    }

    get rangeMin():number|null {

        var n:number = Number.MAX_VALUE

        this.rangeLocations.forEach((range:S3Range) => {

            const start:number|undefined = range.start
            const end:number|undefined = range.end

            if(start !== undefined && start < n)
                n = start

            if(end !== undefined && end < n)
                n = end
        })

        return n === Number.MAX_VALUE ? null : n
    }

    get rangeMax():number|null {

        var n:number = Number.MIN_VALUE

        this.rangeLocations.forEach((range:S3Range) => {

            const start:number|undefined = range.start
            const end:number|undefined = range.end

            if(start !== undefined && start > n)
                n = start

            if(end !== undefined && end > n)
                n = end
        })

        return n === Number.MIN_VALUE ? null : n
    }

    hasFixedLocation():boolean {

        const locations = this.locations

        for(var i = 0; i < locations.length; ++ i) {

            if(locations[i].isFixed())
                return true

        }

        return false
    }

    addRange(start:number, end:number):S3Range {

        const id:string = 'range'

        const identified:S3Identified =
            S3IdentifiedFactory.createChild(this.view, Types.SBOL3.Range, this, Predicates.SBOL3.hasLocation, id, undefined)

        const range:S3Range = new S3Range(this.view, identified.subject)

        range.start = start
        range.end = end

        return range
    }

    addOrientedLocation():S3OrientedLocation {

        const loc:S3Identified = S3IdentifiedFactory.createChild(this.view, Types.SBOL3.OrientedLocation, this, Predicates.SBOL3.hasLocation, 'location', undefined)

        return new S3OrientedLocation(loc.view, loc.subject)
    }

//     setOrientation(orientation:string) {

//         let hadOrientedLocation = false

//         if(this.locations.length > 0) {
//             for(let location of this.locations) {
//                 if(location instanceof S3OrientedLocation) {
//                     location.orientation = orientation
//                     hadOrientedLocation = true
//                 }
//             }
//         }

//         if(hadOrientedLocation)
//             return

//         let loc = this.addOrientedLocation()
//         loc.orientation = orientation
//     }

//     getOrientation():string|undefined {

//         for (let location of this.locations) {
//             if (location instanceof S3OrientedLocation) {
//                 return location.orientation
//             }
//         }

//         return undefined
//     }

	get orientation(): string | undefined {

		return this.getUriProperty(Predicates.SBOL3.orientation)

	}

	set orientation(orientation: string | undefined) {

		this.setUriProperty(Predicates.SBOL3.orientation, orientation)

	}



	get containingInterface():S3Interface|undefined {

		let ifaces = this.graph.match(null, Predicates.SBOL3.input, this.subject)
			.concat( this.graph.match(null, Predicates.SBOL3.output, this.subject))
			.concat( this.graph.match(null, Predicates.SBOL3.nondirectional, this.subject)
			).map(t => t.subject)

		if(ifaces.length === 0) {
			return undefined
		}

		if(ifaces.length !== 1) {
			throw new Error('??')
		}

		return new S3Interface(this.view, ifaces[0])
	}

}

import S3Interface from './S3Interface'

import S3Location from './S3Location'
import S3Range from './S3Range'
import S3IdentifiedFactory from './S3IdentifiedFactory'

import { node, triple, Node } from 'rdfoo'

import { Predicates, Types } from 'bioterms'
import S3OrientedLocation from './S3OrientedLocation';
import S3Component from './S3Component'
import extractTerm from '../extractTerm'

