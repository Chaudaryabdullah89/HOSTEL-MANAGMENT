import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
    try {

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
            where: {
                id: hostelAddress.id
            },
            data: {
                street: hostelAddress.street,
                city: hostelAddress.city,
                state: hostelAddress.state,
                country: hostelAddress.country,
                zipcode: hostelAddress.zipcode,
            }

        })

        const updateHosteldata = await prisma.hostel.update({
            where: {
                id: hostelId
            },
            data: {
                hostelName: hostelName,
                hostelType: hostelType,
                hostelsStatus: hostelsStatus,
                contact: contact ? parseInt(contact.toString().replace(/\D/g, '').substring(0, 9)) : null,
                floors: parseInt(floors),
                description: description,
                amenities: amenities || [],
                wardensIds: wardensIds || [],
                // Sync the wardens relation so UI can display warden names
                wardens: wardensIds !== undefined
                    ? { set: (wardensIds || []).map((id: string) => ({ id })) }
                    : undefined,
                address: {
                    connect: {
                        id: hostelAddress.id
                    }
                }
            }
        })

        // Smart sync warden assignments
        const warnings: any[] = [];
        if (wardensIds !== undefined) {
            try {
                const newUserIds = Array.isArray(wardensIds) ? wardensIds : [];

                // Get all warden records that have this hostelId
                const allWardens = await prisma.warden.findMany({
                    where: {
                        hostelIds: {
                            has: hostelId
                        }
                    },
                    select: { userId: true }
                });
                const currentUserIds = allWardens.map((w: any) => w.userId);

                // Calculate changes
                const toRemove = currentUserIds.filter((id: string) => !newUserIds.includes(id));
                const toAdd = newUserIds.filter((id: string) => !currentUserIds.includes(id));

                // Remove hostelId from wardens no longer assigned
                if (toRemove.length > 0) {
                    for (const userId of toRemove) {
                        const warden = await prisma.warden.findUnique({
                            where: { userId: userId }
                        });

                        if (warden) {
                            const updatedHostelIds = warden.hostelIds.filter((id: string) => id !== hostelId);

                            if (updatedHostelIds.length === 0) {
                                // Delete warden record if no hostels left
                                await prisma.warden.delete({
                                    where: { userId: userId }
                                });
                                console.log(`Removed warden record for user ${userId} (no hostels remaining)`);
                            } else {
                                // Update warden record to remove this hostelId
                                await prisma.warden.update({
                                    where: { userId: userId },
                                    data: { hostelIds: updatedHostelIds }
                                });
                                console.log(`Removed hostel ${hostelName} from warden ${userId}`);
                            }
                        }
                    }
                }

                // Add new warden assignments with validation
                for (const userId of toAdd) {
                    // Check if user exists and has WARDEN role
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                        include: {
                            wardens: {
                                select: {
                                    hostelIds: true
                                }
                            }
                        }
                    });

                    if (!user) {
                        warnings.push({
                            type: 'USER_NOT_FOUND',
                            userId: userId,
                            message: `User with ID ${userId} not found`
                        });
                        console.warn(`User with ID ${userId} not found`);
                        continue;
                    }

                    // Validate WARDEN role
                    if (user.role !== 'WARDEN') {
                        warnings.push({
                            type: 'INVALID_ROLE',
                            userId: userId,
                            userName: user.name,
                            currentRole: user.role,
                            message: `User ${user.name} has role ${user.role}, not WARDEN`
                        });
                        console.warn(`User ${user.name} has role ${user.role}, cannot assign as warden`);
                        continue;
                    }

                    // Get or create warden record
                    const existingWarden = user.wardens[0];

                    if (existingWarden) {
                        // Check if hostel already in array
                        if (existingWarden.hostelIds.includes(hostelId)) {
                            console.log(`Warden ${user.name} already assigned to hostel ${hostelName} - skipping`);
                            continue;
                        }

                        // Check for other hostel assignments (warning)
                        if (existingWarden.hostelIds.length > 0) {
                            const otherHostels = await prisma.hostel.findMany({
                                where: {
                                    id: { in: existingWarden.hostelIds }
                                },
                                select: { hostelName: true }
                            });

                            otherHostels.forEach((h: any) => {
                                warnings.push({
                                    type: 'MULTI_HOSTEL',
                                    userId: userId,
                                    userName: user.name,
                                    otherHostel: h.hostelName,
                                    message: `Warden ${user.name} is already assigned to ${h.hostelName}`
                                });
                            });
                        }

                        // Add hostelId to array
                        await prisma.warden.update({
                            where: { userId: userId },
                            data: {
                                hostelIds: {
                                    push: hostelId
                                }
                            }
                        });
                        console.log(`Warden ${user.name} assigned to hostel ${hostelName} (now manages ${existingWarden.hostelIds.length + 1} hostels)`);
                    } else {
                        // Create new warden record
                        await prisma.warden.create({
                            data: {
                                userId: userId,
                                hostelIds: [hostelId]
                            }
                        });
                        console.log(`Warden ${user.name} newly assigned to hostel ${hostelName}`);
                    }
                }
            } catch (wardenError) {
                console.error("Error syncing warden assignments:", wardenError);
            }
        }

        return NextResponse.json({
            message: "Hostel updated successfully",
            data: {
                updateAddressdata,
                updateHosteldata
            },
            warnings: warnings.length > 0 ? warnings : undefined
        });
    }
    catch (error) {
        console.error("Error updating hostel:", error);
        return NextResponse.json(
            { error: "Failed to update hostel" },
            { status: 500 }
        );
    }

}