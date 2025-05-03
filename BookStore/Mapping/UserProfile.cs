using AutoMapper;

namespace BookStore.Mapping;

public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<Entities.User, DTOs.User.UserDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Role, opt => opt.Ignore());
        CreateMap<DTOs.User.RegisterUserDTO, Entities.User>();
    }
}