import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
    try{
      
        const body = await request.json();
        const {
            hostelId,
            hostelName,
           hostelAddress,
          
            hostelType,
            hostelsStatus,
            contact,
            floors,
            description,
            amenities,
            //  capacity,
            // occupiedRooms,
            // image,
            // revenue,
            wardensIds,
        } = body;

        
        if (!hostelAddress || !hostelAddress.id) {
            return NextResponse.json(
                { error: "Address ID is required for updating hostel" },
                { status: 400 }
            );
        }

        
        const updateAddressdata = await prisma.hostelAddress.update({
            where :{
                id: hostelAddress.id
            },
            data :{
                street: hostelAddress.street,
                city: hostelAddress.city,
                state: hostelAddress.state,
                country: hostelAddress.country,
                zipcode: hostelAddress.zipcode,
            }

        })

        const updateHosteldata = await prisma.hostel.update({
            where :{
                id: hostelId
            },
            data :{
                hostelName: hostelName,
                hostelType: hostelType,
                hostelsStatus: hostelsStatus,
                contact: contact ? parseInt(contact.toString().replace(/\D/g, '').substring(0, 9)) : null,
                floors: parseInt(floors),
                description: description,
                amenities: amenities || [],
                wardensIds : wardensIds || [],
                address: {
                    connect: {
                        id: hostelAddress.id
                    }
                }
            }
        })
        
        return NextResponse.json({
            message: "Hostel updated successfully",
            data: {
                updateAddressdata,
                updateHosteldata
            }
        });
    }
    catch(error){
        console.error("Error updating hostel:", error);
        return NextResponse.json(
            { error: "Failed to update hostel" },
            { status: 500 }
        );
    }
    
}