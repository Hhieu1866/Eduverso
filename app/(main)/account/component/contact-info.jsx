"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import { Loader2, Phone, Globe, Plus } from "lucide-react";

const ContactInfo = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [contactInfo, setContactInfo] = useState({
        phone: "",
        website: ""
    });

    const handleChange = (e) => {
        setContactInfo({
            ...contactInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Thông tin liên hệ đã được cập nhật");
            
            // Clear form after success
            setContactInfo({
                phone: "",
                website: ""
            });
        } catch (error) {
            toast.error("Không thể cập nhật thông tin liên hệ");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="px-0 pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                    Thông tin liên hệ
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Cập nhật thông tin liên hệ của bạn
                </CardDescription>
            </CardHeader>
            <Separator className="mb-6" />
            <CardContent className="px-0 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                                <Phone className="h-4 w-4" />
                            </div>
                            <Input
                                type="tel"
                                name="phone"
                                value={contactInfo.phone}
                                onChange={handleChange}
                                placeholder="Số điện thoại"
                                className="pl-10 focus:ring-primary"
                            />
                        </div>
                        
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                                <Globe className="h-4 w-4" />
                            </div>
                            <Input
                                type="url"
                                name="website"
                                value={contactInfo.website}
                                onChange={handleChange}
                                placeholder="Website của bạn (bao gồm https://)"
                                className="pl-10 focus:ring-primary"
                            />
                        </div>
                    </div>
                    
                    <Button 
                        type="submit" 
                        variant="outline" 
                        className="gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Đang thêm...</span>
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                <span>Thêm thông tin</span>
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default ContactInfo;