import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { HostelStatus, HostelType } from "@prisma/client";

export async function POST(request: NextRequest) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const {
            name,
            hostelAddress,
            hostelType,
            hostelStatus,
            contact,
            floors,
            description,
            amenities,
            // capacity,
            // occupiedRooms,
            // image,
            // revenue,
        wardenId,
            wardensIds,
        } = body;
        console.log("BODY ", body);
        console.log("hostelStatus received:", hostelStatus);
        console.log("hostelStatus type:", typeof hostelStatus);
        
      
        const getHostelTypeEnum = (type: string) => {
            switch (type?.toLowerCase()) {
                case 'BUDGET': return HostelType.BUDGET;
                case 'STANDARD': return HostelType.STANDARD;
                case 'PREMIUM': return HostelType.PREMIUM;
                default: return HostelType.STANDARD;
            }
        };

        const hostelTypeEnum = getHostelTypeEnum(hostelType);
       
         const getHostelStatusEnum = (status: string) => {
            switch (status?.toLowerCase()) {
                case 'active': return HostelStatus.ACTIVE;
                case 'inactive': return HostelStatus.INACTIVE;
                default: return HostelStatus.ACTIVE;
            }
        };  
        const hostelStatusEnum = getHostelStatusEnum(hostelStatus);
        console.log("hostelStatusEnum converted:", hostelStatusEnum);
        // Basic field validation
        // if (
        //     !name ||
        //         !hostelAddress ||
        //     !hostelAddress.street ||
        //     !hostelAddress.city ||
        //     !hostelAddress.state ||
        //     !hostelAddress.country ||
        //     !hostelAddress.zipcode
        // ) {
        //     return NextResponse.json(
        //         { error: "Missing required hostel or address fields" }, 
        //         { status: 400 }
        //     );
        // }

        const session = await getServerSession(request);
        if (!session.loggedIn) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let addressId;
        try {
            addressId = await prisma.hostelAddress.create({
                data: {
                    street: hostelAddress.street,
                    city: hostelAddress.city,
                    state: hostelAddress.state,
                    country: hostelAddress.country,
                    zipcode: hostelAddress.zipcode,
                },
            });
        } catch (dbAddressError) {
            console.error("Hostel address creation error:", dbAddressError);
            return NextResponse.json(
                { error: "Error creating hostel address", details: dbAddressError instanceof Error ? dbAddressError.message : String(dbAddressError) },
                { status: 500 }
            );
        }

        let hostel;
        try {
            hostel = await prisma.hostel.create({
                data: {
                    hostelName: name,
                    description: description,
                    hostelType: hostelTypeEnum,
                    hostelsStatus: hostelStatusEnum,
                    contact: contact ? parseInt(contact.toString().replace(/\D/g, '').substring(0, 9)) : null,
                    floors : parseInt(floors),
                    amenities: amenities,
                    // capacity : parseInt(capacity),
                    // occupiedRooms : parseInt(occupiedRooms),
                    // image,
                    // revenue : parseInt(revenue),
                    userId: session.user.id,
                    addressId: addressId.id,
                },
                select :{
                    id: true,
                    hostelName: true,
                    description: true,
                    hostelType: true,
                    hostelsStatus: true,
                    contact: true,
                    floors: true,
                    amenities: true,
                    userId: true,
                    addressId: true,
                    address: {
                        select: {
                            id: true,
                            street: true,
                            city: true,
                            state: true,
                            country: true,
                            zipcode: true,
                        }
                    },
                    wardensIds: true,
                    Warden: {
                        select: {
                            id: true,
                            userId: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                }
                            },
                            hostelId: true,
                        }
                    },
                    createdAt: true,
                    updatedAt: true,
                }
            });

          
            if (wardensIds && Array.isArray(wardensIds) && wardensIds.length > 0) {
                try {
                    for (const userId of wardensIds) {
                        // Check if user exists
                        const user = await prisma.user.findUnique({
                            where: { id: userId }
                        });

                        if (user) {
                            
                            const existingWarden = await prisma.warden.findFirst({
                                where: {
                                    userId: userId,
                                    hostelId: hostel.id
                                }
                            });

                            if (!existingWarden) {
                                // Create warden record for this hostel
                                await prisma.warden.create({
                                    data: {
                                        userId: userId,
                                        hostelId: hostel.id
                                    }
                                });
                                console.log(`Warden ${user.name} assigned to hostel ${hostel.hostelName}`);
                            } else {    
                                console.log(`Warden ${user.name} already assigned to hostel ${hostel.hostelName}`);
                            }
                        } else {
                            console.warn(`User with ID ${userId} not found`);
                        }
                    }
                } catch (wardenError) {
                    console.error("Error assigning wardens:", wardenError);
                }
            }
            
         
            if (wardenId && !wardensIds) {
                try {
                    const warden = await prisma.warden.findUnique({
                        where: { id: wardenId },
                        include: { user: true }
                    });

                    if (warden) {
                        await prisma.warden.update({
                            where: { id: wardenId },
                            data: { hostelId: hostel.id }
                        });
                        console.log(`Warden ${warden.user.name} assigned to hostel ${hostel.hostelName}`);
                    } else {
                        console.warn(`Warden with ID ${wardenId} not found`);
                    }
                } catch (wardenError) {
                    console.error("Error assigning warden:", wardenError);
                }
            }
        
            console.log("HOSTEL ", hostel);
            return NextResponse.json(hostel, { status: 201 });

        } catch (dbHostelError) {
            console.error("Hostel creation error:", dbHostelError);
            return NextResponse.json(
                { error: "Error creating hostel", details: dbHostelError instanceof Error ? dbHostelError.message : String(dbHostelError) },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Unhandled error in /api/hostel/create:", error);
        return NextResponse.json(
            {
                error: "Internal Server Error",
                details: process.env.NODE_ENV === "development" ? String(error) : undefined,
            },
            { status: 500 }
        );
    }
}
