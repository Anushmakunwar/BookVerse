using AutoMapper;
using BookStore.DTOs.Announcement;

namespace BookStore.Mapping
{
    public class AnnouncementProfile : Profile
    {
        public AnnouncementProfile()
        {
            // Announcement -> AnnouncementDTO
            CreateMap<Entities.Announcement, AnnouncementDTO>()
                .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedBy.FullName));
        }
    }
}
